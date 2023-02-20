import { createTRPCRouter, protectedProcedure } from '@app/server/api/trpc';
import { UpdateSettingsInput, userService } from '@app/services/user-service';

export const userRouter = createTRPCRouter({
  getAllPosts: protectedProcedure.query(async ({ ctx }) => {
    return userService.getAllPosts(ctx);
  }),

  updateSettings: protectedProcedure.input(UpdateSettingsInput).mutation(async ({ ctx, input }) => {
    return userService.updateSettings(ctx, input);
  }),

  deactivateAccount: protectedProcedure.mutation(async ({ ctx }) => {
    return userService.deactivateAccount(ctx);
  }),
});
