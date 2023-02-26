import { createTRPCRouter, protectedProcedure } from '@app/server/api/trpc';

export const adminRouter = createTRPCRouter({
  getReports: protectedProcedure
    .query(({ ctx }) => {
      return ctx.prisma?.reports.findMany();
    }),

  getUsers: protectedProcedure
    .query(({ ctx }) => {
      return ctx.prisma?.user.findMany({
        include: {
          page: true,
        }
      });
    }),
});
