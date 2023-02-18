import { CreatePostInput, DeletePostInput, EditPostInput, GetExplorePostsInput, GetPostDetailsInput, postService } from '@app/services/post-service';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const postRouter = createTRPCRouter({
  createPost: protectedProcedure
    .input(CreatePostInput)
    .mutation(async ({ ctx, input }) => {
      return postService.createPost(ctx, input);
    }),

  editPost: protectedProcedure
    .input(EditPostInput)
    .mutation(async ({ ctx, input }) => {
      return postService.editPost(ctx, input);
    }),

  deletePost: protectedProcedure
    .input(DeletePostInput)
    .mutation(async ({ ctx, input }) => {
      return postService.deletePost(ctx, input);
    }),

  getPostDetails: publicProcedure
    .input(GetPostDetailsInput)
    .query(async ({ ctx, input }) => {
      return postService.getPostDetails(ctx, input);
    }),

  getExplorePosts: publicProcedure
    .input(GetExplorePostsInput)
    .query(async ({ ctx, input }) => {
      return postService.getExplorePosts(ctx, input);
    })
});
