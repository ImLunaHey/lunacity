import { CreatePageInput, FollowingStateInput, FollowPageInput, GetPageDetailsInput, GetPageFollowingInput, GetPagePostsInput, PageExistsInput, pageService, UnfollowPageInput } from '@app/services/page-service';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const pageRouter = createTRPCRouter({
  createPage: protectedProcedure
    .input(CreatePageInput)
    .mutation(async ({ ctx, input }) => {
      return pageService.createPage(ctx, input);
    }),

  pageExists: publicProcedure
    .input(PageExistsInput)
    .query(async ({ ctx, input }) => {
      return pageService.pageExists(ctx, input);
    }),

  getUsersPages: protectedProcedure
    .query(async ({ ctx }) => {
      return pageService.getUsersPages(ctx);
    }),

  getPageDetails: publicProcedure
    .input(GetPageDetailsInput)
    .query(async ({ ctx, input }) => {
      return pageService.getPageDetails(ctx, input);
    }),

  getPageFollowing: publicProcedure
    .input(GetPageFollowingInput)
    .query(async ({ ctx, input }) => {
      return pageService.getPageFollowing(ctx, input);
    }),

  getPagePosts: publicProcedure
    .input(GetPagePostsInput)
    .query(async ({ ctx, input }) => {
      return pageService.getPagePosts(ctx, input);
    }),

  followPage: protectedProcedure
    .input(FollowPageInput)
    .mutation(async ({ ctx, input }) => {
      return pageService.followPage(ctx, input);
    }),

  unfollowPage: protectedProcedure
    .input(UnfollowPageInput)
    .mutation(async ({ ctx, input }) => {
      return pageService.unfollowPage(ctx, input);
    }),

  getFollowingState: protectedProcedure
    .input(FollowingStateInput).query(async ({ ctx, input }) => {
      return pageService.getFollowingState(ctx, input);
    }),
});
