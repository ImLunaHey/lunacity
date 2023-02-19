import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@app/server/api/trpc';
import { observable } from '@trpc/server/observable';
import { bus, type BusEvents } from '@app/server/bus';
import { logger } from '@app/server/logger';

// @TODO: fix this fuckery
type BusSession = Parameters<Parameters<typeof protectedProcedure['subscription']>[0]>[0]['ctx']['session'];
const createBusObserver = <Event extends keyof BusEvents = keyof BusEvents>(eventName: Event, session: BusSession) => {
  return observable<Parameters<BusEvents[Event]>[0]>(emit => {
    try {
      const handler: BusEvents[Event] = ({ userId, ...opts }) => {
        if (session.user.id !== userId) return;
        // @TODO: Fix this maybe?
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        emit.next(opts as any);
      };

      bus.on(eventName, handler);
      return () => {
        bus.off(eventName, handler);
      };
    } catch (error) {
      logger.error(error);
    }
  });
}

export const notificationRouter = createTRPCRouter({
  getAllNotifications: protectedProcedure
    .input(
      z
        .object({
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx: { prisma, session }, input }) => {
      const notifications = await prisma?.notification.findMany({
        take: 100,
        where: {
          notifiedId: session.user.id
        },
        ...(input?.cursor
          ? {
            cursor: {
              id: input?.cursor,
            },
          }
          : {}),
        include: {
          data: {
            include: {
              comment: true,
              page: true,
              post: true
            }
          }
        }
      });

      return notifications;
    }),

  getLiveNotifications: protectedProcedure.subscription(({ ctx: { session } }) => {
    return createBusObserver('newNotification', session);
  })
});
