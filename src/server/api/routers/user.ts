import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const userRouter = createTRPCRouter({
  // infinitePosts: t
  //   .procedure
  //   .input(z.object({
  //     limit: z.number().min(1).max(100).nullish(),
  //     cursor: z.number().nullish(), // <-- "cursor" needs to exist, but can be any type
  //   }))
  //   .query(({ input }) => {
  //     const limit = input.limit ?? 50;
  //     const { cursor } = input;
  //     const items = await prisma.post.findMany({
  //       take: limit + 1, // get an extra item at the end which we'll use as next cursor
  //       where: {
  //         title: {
  //           contains: 'Prisma' /* Optional filter */,
  //         },
  //       },
  //       cursor: cursor ? { myCursor: cursor } : undefined,
  //       orderBy: {
  //         myCursor: 'asc',
  //       },
  //     })
  //     let nextCursor: typeof cursor | undefined = undefined;
  //     if (items.length > limit) {
  //       const nextItem = items.pop()
  //       nextCursor = nextItem!.myCursor;
  //     }
  //     return {
  //       items,
  //       nextCursor,
  //     };
  //   })

  getAllPosts: publicProcedure.query(async ({ ctx: { prisma, session } }) => {
    // Unauthenticated user
    if (!session?.user) return [];

    // Get the current session's page
    const sessionPage = await prisma.page.findUnique({
      where: {
        userId: session.user.id
      }
    });

    // No page found for the current session
    if (!sessionPage)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No page found for your session.',
      });

    // Authenticated user
    return prisma?.post.findMany({
      where: {
        page: {
          followedBy: {
            some: {
              followerId: sessionPage.id,
            },
          },
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
  }),

  updateSettings: protectedProcedure.input(z.object({
    handle: z.string().optional(),
    email: z.string().optional(),
    displayName: z.string().optional()
  })).mutation(async ({ ctx: { prisma, session }, input }) => {

    // If they're trying to update their handle
    // if (input.handle) {
    //   const existingUserWithHandle = await prisma.user.findUnique({
    //     where: {
    //       handle: input.handle
    //     }
    //   });
    //   // TODO: finish this
    // }

    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        page: {
          update: {
            handle: input.handle,
            displayName: input.displayName,
          }
        }
      }
    });
  }),

  deactivateAccount: protectedProcedure.mutation(async ({ ctx: { prisma, session } }) => {
    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        deactivatedTimestamp: new Date()
      }
    })
  }),
});
