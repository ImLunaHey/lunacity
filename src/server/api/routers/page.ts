import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const pageRouter = createTRPCRouter({
  // hello: publicProcedure
  //   .input(z.object({ text: z.string() }))
  //   .query(({ input }) => {
  //     return {
  //       greeting: `Hello ${input.text}`,
  //     };
  //   }),

  // getAll: publicProcedure.query(({ ctx }) => {
  //   return ctx.prisma.example.findMany();
  // }),

  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),

  createPage: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        handle: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { name, handle } }) => {
      // The handle must be at least 1 character long
      if (handle.trim().length === 0) throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'The handle must be at least 1 character long.',
      });

      // The handle must be no more than 25 characters long
      if (handle.trim().length >= 26) throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'The handle must be no more than 25 character long.',
      });

      // The handle must not be any of these reserved words
      if (['null', 'undefined', 'signin', 'signout', 'signup', 'tos', ...'abcdefghijklmnopqrstuvwxyz', ...'abcdefghijklmnopqrstuvwxyz'.toUpperCase()].includes(handle)) throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'This handle is reserved, please contact @staff if you have a valid use case.',
      });

      // Check if the handle is taken
      const handleTaken = await prisma?.page.count({ where: { handle } }) ?? 0 >= 1;
      if (handleTaken) throw new TRPCError({
        code: 'CONFLICT',
        message: `The handle "@${handle}" is taken.`,
      });

      // Create the page
      await ctx.prisma.page.create({
        data: {
          name: name.trim() || `@${handle}`,
          handle,
          ownerId: ctx.session.user.id
        },
      });
    }),

  pageExists: publicProcedure
    .input(z.object({
      handle: z.string()
    }))
    .query(async ({ input: { handle } }) => {
      const count = await prisma?.page.count({ where: { handle: handle.replace('@', '') } });
      return count ?? 0 >= 1;
    }),

  getUsersPages: protectedProcedure
    .query(({ ctx: { session, prisma } }) => {
      return prisma?.page.findMany({
        where: {
          ownerId: session.user.id,
        }
      })
    }),

  getPageDetails: publicProcedure
    .input(z.object({
      handle: z.string()
    }))
    .query(async ({ ctx: { session, prisma }, input }) => {
      const handle = input.handle.replace('@', '');

      // Get page details
      const page = await prisma.page.findFirst({
        where: {
          handle
        },
        include: {
          // Get all infractions that end AFTER now
          infractions: {
            where: {
              endTimestamp: {
                gte: new Date()
              }
            }
          },
          followedBy: {
            select: {
              followerId: true
            }
          }
        }
      });

      // If the user is signed out return public details
      if (!session?.user?.id) return page;
      
      // If the user is signed in check if they have permission to get more details, if they don't then return public details
      if (page?.ownerId !== session.user.id) return page;

      // If the user is the owner return more details
      // TODO: The comment above
      return page;
    }),

    getPagePosts: publicProcedure
      .input(z.object({
        handle: z.string()
      }))
      .query(async ({ ctx: { session, prisma }, input }) => {
        const handle = input.handle.replace('@', '');

        // Get all the posts for this page
        const posts = await prisma.post.findMany({
          where: {
            page: {
              handle
            }
          },
          include: {
            tags: true,
            page: true
          }
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
        .input(z.object({
          handle: z.string()
        }))
        .mutation(({ ctx: { prisma, session }, input }) => {
          // Check if the user is signed in
          if (!session) throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You must be signed in to follow pages.',
          });

          console.log(session);

          // Follow the page
          // const follower = await prisma.page.findFirstOrThrow({ where: { id: session.page.id } }); // This is the page we're signed-in as
          // const following = await prisma.page.findFirstOrThrow({ where: { handle: input.handle } }); // This is the page we're following
          // return prisma.page.update({
          //   where: { id: from.id },
          //   data: {
          //     following: {
          //       connect: {
          //         followerId_followingId: {
          //           followerId: follower.id,
          //           followingId: following.id
          //         }
          //       }
          //     }
          //   }
          // })
        })
});
