import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const searchRouter = createTRPCRouter({
  query: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(({ ctx: { prisma }, input: { query } }) => {
      return prisma?.page.findMany({
        where: {
          OR: [{
            displayName: {
              contains: query
            }
          }, {
            handle: {
              contains: query
            }
          }]
        }
      });
    }),
});
