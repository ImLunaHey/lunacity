import { messageService } from '@app/services/message-service';
import { createTRPCRouter, protectedProcedure } from '@app/server/api/trpc';

export const messageRouter = createTRPCRouter({
  getAllMessageThreads: protectedProcedure
    .query(({ ctx }) => {
      return messageService.getAllMessageThreads(ctx);
    }),
});
