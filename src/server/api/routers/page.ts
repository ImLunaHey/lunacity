import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { handleTRPCError } from '../../../common/handle-trpc-error';
import { bus } from '../../bus';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const pageRouter = createTRPCRouter({
  createPage: protectedProcedure
    .input(
      z.object({
        displayName: z.string(),
        handle: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input: { displayName, handle, description } }) => {
      // The handle must be at least 1 character long
      if (handle.trim().length === 0)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'The handle must be at least 1 character long.',
        });

      // The handle must be no more than 25 characters long
      if (handle.trim().length >= 26)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'The handle must be no more than 25 character long.',
        });

      // The handle must not be any of these reserved words
      if (
        [
          'null',
          'undefined',
          'signin',
          'signout',
          'signup',
          'tos',
          ...'abcdefghijklmnopqrstuvwxyz',
          ...'abcdefghijklmnopqrstuvwxyz'.toUpperCase(),
        ].includes(handle)
      )
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'This handle is reserved, please contact @staff if you have a valid use case.',
        });

      // Check if the handle is taken
      const handleTaken =
        (await ctx.prisma?.page.count({ where: { handle } })) ?? 0 >= 1;
      if (handleTaken)
        throw new TRPCError({
          code: 'CONFLICT',
          message: `The handle "@${handle}" is taken.`,
        });

      // Create the page
      const userPage = await ctx.prisma.page.create({
        data: {
          displayName: displayName.trim() || `@${handle}`,
          handle,
          description,
          owner: {
            connect: {
              id: ctx.session.user.id
            }
          }
        },
      });

      // Make page follow itself
      await ctx.prisma.follows.create({
        data: {
          followerId: userPage.id,
          followingId: userPage.id
        }
      });
    }),

  pageExists: publicProcedure
    .input(
      z.object({
        handle: z.string(),
      })
    )
    .query(async ({ ctx, input: { handle } }) => {
      const count = await ctx.prisma?.page.count({
        where: { handle: handle.replace('@', '') },
      });
      return count ?? 0 >= 1;
    }),

  getUsersPages: protectedProcedure.query(async ({ ctx: { session, prisma } }) => {
    return prisma?.page.findMany({
      where: {
        OR: [{
          ownerId: session.user.id,
        }, {
          moderators: {
            some: {
              id: session.user.id
            }
          }
        }]
      },
    });
  }),

  getPageDetails: publicProcedure
    .input(
      z.object({
        handle: z.string(),
      })
    )
    .query(async ({ ctx: { session, prisma }, input }) => {
      const handle = input.handle.replace('@', '');

      // Get page details
      const page = await prisma.page.findFirst({
        where: {
          handle,
        },
        include: {
          // Get all infractions that end AFTER now
          infractions: {
            where: {
              endTimestamp: {
                gte: new Date(),
              },
            },
          }
        },
      });

      // No page found for that handle
      if (!page)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No page found for this handle.',
        });


      // If the user is signed in, check if the user's own page is following this page
      const following = session?.user ? await prisma.page.findFirst({
        where: {
          handle, followedBy: {
            some: {
              follower: {
                userId: session?.user.id
              }
            }
          }
        }
      }).then(following => following !== null) : false;

      // How many pages this page is following
      const followingCount = session?.user ? await prisma.follows.aggregate({
        where: {
          followerId: page?.id
        },
        _count: true
      }).then(result => result._count) : 0;

      // How many pages this page has following it
      const followerCount = session?.user ? await prisma.follows.aggregate({
        where: {
          followingId: page?.id
        },
        _count: true
      }).then(result => result._count) : 0;

      return {
        ...page,
        following,
        followingCount,
        followerCount,
      }
    }),

  getPageFollowing: publicProcedure
    .input(
      z.object({
        handle: z.string(),
      })
    )
    .query(async ({ ctx: { prisma }, input }) => {
      const handle = input.handle.replace('@', '');

      // Get a list of pages who follow this page
      return prisma.follows.findMany({
        where: {
          following: {
            handle
          }
        },
        include: {
          follower: true,
          following: true
        },
        orderBy: [{
          createdAt: 'asc'
        }]
      });
    }),

  getPagePosts: publicProcedure
    .input(
      z.object({
        handle: z.string(),
      })
    )
    .query(async ({ ctx: { session, prisma }, input }) => {
      const handle = input.handle.replace('@', '');

      // Get all the posts for this page
      const posts = await prisma.post.findMany({
        where: {
          page: {
            handle,
          },
        },
        include: {
          tags: true,
          page: {
            include: {
              owner: true,
            },
          },
          media: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // If the user is signed out return public posts
      if (!session?.user?.id) return posts;

      return posts;

      // // If the user is signed in check if they have permission to get more posts, if they don't then return public post
      // if (page?.ownerId !== session.user.id) return posts;

      // // If the user is the owner return more details
      // // TODO: The comment above
      // return page;
    }),

  followPage: protectedProcedure
    .input(
      z.object({
        handle: z.string(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input: { handle } }) => {
      // Check if the user is signed in
      if (!session)
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You must be signed in to follow pages.',
        });

      // Get the page
      const page = await prisma.page.findUnique({
        where: {
          handle,
        },
        include: {
          owner: true
        }
      });

      // No page found for that handle
      if (!page)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No page found for this handle.',
        });

      // Get the current session's page
      const userPage = await prisma.page.findFirst({
        where: {
          userId: session.user.id
        }
      });

      // No page found for the current session's user
      if (!userPage)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No page found for this handle.',
        });

      // Follow the page and send a notification to the page they followed
      const [, { id }] = await prisma.$transaction([
        prisma.page.update({
          where: { handle },
          data: {
            followedBy: {
              create: {
                followerId: userPage.id,
              },
            },
          },
        }),
        prisma.notification.create({
          data: {
            type: 'FOLLOWED',
            notified: {
              connect: {
                id: page.owner.id
              }
            },
            data: {
              create: {
                pageId: userPage.id
              }
            }
          }
        })
      ]);

      // Get the newly created notification
      const notification = await prisma.notification.findUnique({
        where: {
          id
        },
        include: {
          data: {
            include: {
              comment: true,
              page: true,
              post: true,
            }
          },
          notified: true
        }
      });

      bus.emit('newNotification', {
        userId: page.owner.id,
        notification
      });
    }),

  unfollowPage: protectedProcedure
    .input(
      z.object({
        handle: z.string(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input: { handle } }) => {
      try {
        // Check if the user is signed in
        if (!session)
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You must be signed in to unfollow pages.',
          });

        // Get the page
        const page = await prisma.page.findUnique({
          where: {
            handle,
          },
        });

        // No page found for that handle
        if (!page)
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No page found for this handle.',
          });

        // Get the current session's page
        const userPage = await prisma.page.findFirst({
          where: {
            userId: session.user.id
          }
        });

        // No page found for the current session
        if (!userPage)
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No page found for this handle.',
          });

        // Unfollow the page
        await prisma.follows.delete({
          where: {
            followerId_followingId: {
              followerId: userPage.id,
              followingId: page.id
            },
          },
        });
      } catch (error: unknown) {
        handleTRPCError(error);
      }
    }),

  followingState: publicProcedure.input(z.object({
    handle: z.string()
  })).query(async ({ ctx: { session, prisma }, input: { handle } }) => {
    // Check if the user is signed in
    if (!session)
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You must be signed-in to get your following state of a page.',
      });

    // Get the current session's page
    const userPage = await prisma.page.findFirst({
      where: {
        userId: session.user?.id
      }
    });

    // No page found for the current session
    if (!userPage)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No page found for this handle.',
      });

    // Get the page
    const page = await prisma.page.findUnique({
      where: {
        handle,
      },
    });

    // No page found for that handle
    if (!page)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No page found for this handle.',
      });

    // Check if the session user's page is following the handle provided
    const follows = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userPage.id,
          followingId: page.id
        }
      }
    });

    return follows !== null;
  })
});
