import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@app/server/api/trpc';

export const searchRouter = createTRPCRouter({
  query: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.$transaction([
        ctx.prisma.page.findMany({
          where: {
            OR: [{
              displayName: {
                contains: input.query
              }
            }, {
              handle: {
                contains: input.query
              }
            }]
          },
        }),
        ctx.prisma.post.findMany({
          where: {
            OR: [{
              title: {
                contains: input.query
              }
            }, {
              body: {
                contains: input.query
              }
            }]
          }
        })
      ]).then(([pages, posts]) => [...pages.map(data => ({ type: 'page' as const, data })), ...posts.map(data => ({ type: 'post' as const, data }))]);
    }),
});
