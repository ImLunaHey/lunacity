import { CreateMessageThreadInput, GetThreadMessagesInput, messageService, SendMessageInput } from '@app/services/message-service';
import { createTRPCRouter, protectedProcedure } from '@app/server/api/trpc';

export const messageRouter = createTRPCRouter({
  getAllMessageThreads: protectedProcedure
    .query(({ ctx }) => {
      return messageService.getAllMessageThreads(ctx);
    }),

  getThreadMessages: protectedProcedure
    .input(GetThreadMessagesInput)
    .query(({ ctx, input }) => {
      return messageService.getThreadMessages(ctx, input);
    }),

  createMessageThread: protectedProcedure
    .input(CreateMessageThreadInput)
    .mutation(({ ctx, input }) => {
      return messageService.createMessageThread(ctx, input);
    }),

  sendMessage: protectedProcedure
    .input(SendMessageInput)
    .mutation(({ ctx, input }) => {
      return messageService.sendMessage(ctx, input);
    }),
});
