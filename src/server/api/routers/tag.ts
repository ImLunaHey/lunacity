import { createTRPCRouter, protectedProcedure } from '../trpc';

export const tagRouter = createTRPCRouter({
  getAllTags: protectedProcedure
    .query(({ ctx: { prisma } }) => {
      return prisma?.tag.findMany();
    }),
});
