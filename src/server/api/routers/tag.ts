import { createTRPCRouter, protectedProcedure } from '@app/server/api/trpc';

export const tagRouter = createTRPCRouter({
  getAllTags: protectedProcedure
    .query(({ ctx: { prisma } }) => {
      return prisma?.tag.findMany();
    }),
});
