import { createTRPCRouter, protectedProcedure } from '../trpc';

export const messageRouter = createTRPCRouter({
  getAllMessageThreads: protectedProcedure
    .query(({ ctx: { prisma, session } }) => {
      return prisma?.messageThread.findMany({
        where: {
          participants: {
            some: {
              owner: {
                id: session.user.id
              }
            }
          }
        },
        include: {
          messages: true,
          participants: true
        }
      });
    }),
});
