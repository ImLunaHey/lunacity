import { createTRPCRouter } from './trpc';
import { pageRouter } from './routers/page';
import { tagRouter } from './routers/tag';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  page: pageRouter,
  tag: tagRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
