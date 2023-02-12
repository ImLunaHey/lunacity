import { CreatePostInput, GetExplorePostsInput, GetPostDetailsInput, postService } from '@app/services/post-service';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const postRouter = createTRPCRouter({
  createPost: protectedProcedure
    .input(CreatePostInput)
    .mutation(async ({ ctx, input }) => {
      return postService.createPost(ctx, input);
    }),

  getPostDetails: publicProcedure
    .input(GetPostDetailsInput)
    .query(async ({ ctx, input }) => {
      return postService.getPostDetails(ctx, input);
    }),

  getExplorePosts: publicProcedure
    .input(GetExplorePostsInput)
    .query(async ({ ctx, input }) => {
      return postService.getExporePosts(ctx, input);
    })
});
