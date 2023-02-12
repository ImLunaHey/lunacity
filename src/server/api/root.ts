import { createTRPCRouter } from './trpc';
import { searchRouter } from '@app/server/api/routers/search';
import { notificationRouter } from '@app/server/api/routers/notification';
import { pageRouter } from '@app/server/api/routers/page';
import { postRouter } from '@app/server/api/routers/post';
import { tagRouter } from '@app/server/api/routers/tag';
import { userRouter } from '@app/server/api/routers/user';
import { messageRouter } from '@app/server/api/routers/message';

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
  notification: notificationRouter,
  search: searchRouter,
  message: messageRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
