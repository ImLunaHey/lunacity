import { createTRPCRouter } from './trpc';
import { pageRouter } from './routers/page';
import { tagRouter } from './routers/tag';
import { postRouter } from './routers/post';
import { userRouter } from './routers/user';
import { notificationRouter } from './routers/notification';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  page: pageRouter,
  post: postRouter,
  tag: tagRouter,
  user: userRouter,
  notification: notificationRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
