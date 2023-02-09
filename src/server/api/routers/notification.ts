import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { observable } from '@trpc/server/observable';
import { bus, BusEvents } from '../../bus';

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
        take: 10,
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
    return observable<Parameters<BusEvents['newNotification']>[0]>(emit => {
      try {
        const onNewNotification: BusEvents['newNotification'] = (opts) => {
          emit.next(opts as any);
        };

        bus.on('newNotification', onNewNotification);
        return () => {
          bus.off('newNotification', onNewNotification);
        };
      } catch (error) {
        console.log('error', error);
      }
    });
  })
});
