import type { PrivateServiceContext } from '@app/types/service';
import { z } from 'zod';
import { logger } from '@app/server/logger'

export const CreateMessageThreadInput = z.object({
    participants: z.array(z.string()),
});

export const GetThreadMessagesInput = z.object({
    threadId: z.string(),
});

export const SendMessageInput = z.object({
    threadId: z.string(),
    text: z.string(),
});

class MessageService {
    async getAllMessageThreads(ctx: PrivateServiceContext) {
        return ctx.prisma?.messageThread.findMany({
            where: {
                participants: {
                    some: {
                        owner: {
                            id: ctx.session.user?.id
                        }
                    }
                }
            },
            include: {
                messages: true,
                participants: true
            }
        });
    }

    async getThreadMessages(ctx: PrivateServiceContext, input: z.infer<typeof GetThreadMessagesInput>) {
        const currentPage = await ctx.prisma?.page.findFirst({
            where: {
                user: {
                    id: ctx.session.user?.id
                },
            }
        });

        // Don't allow the current user to get messages from a thread unless they're a participant
        const thread = await ctx.prisma?.messageThread.findFirst({
            where: {
                id: input.threadId,
                participants: {
                    some: {
                        id: currentPage?.id
                    }
                }
            }
        });
        if (!thread) throw new Error('You are not a participant of this thread.');

        return ctx.prisma?.message.findMany({
            where: {
                messageThread: {
                    id: input.threadId
                }
            }
        });
    }

    async createMessageThread(ctx: PrivateServiceContext, input: z.infer<typeof CreateMessageThreadInput>) {
        const currentPage = await ctx.prisma?.page.findFirst({
            where: {
                user: {
                    id: ctx.session.user?.id
                },
            }
        });

        // Don't allow the current user to start a message thread unless they have a page
        if (!currentPage) throw new Error('You must have a page to start a message thread.');

        // Don't allow the current user to start a message thread with themselves
        if (input.participants.includes(currentPage?.handle)) throw new Error('You cannot start a message thread with yourself.');

        // Do all of the participants exist
        const participants = await ctx.prisma?.page.findMany({
            where: {
                handle: {
                    in: input.participants
                }
            }
        });
        if (participants.length !== input.participants.length) throw new Error('One or more participants do not exist.');

        // Do any of the participants have the current user blocked
        const blockedBy = await ctx.prisma?.block.findMany({
            where: {
                AND: [{
                    blocked: {
                        user: {
                            id: ctx.session.user?.id
                        }
                    }
                }, {
                    blocker: {
                        id: {
                            in: participants.map(({ id }) => id)
                        }
                    }
                }]
            },
            include: {
                blocked: true,
                blocker: true
            }
        });

        // Log the blocked participants
        if (blockedBy.length > 0) {
            logger.error(`Failed to create message thread for ${currentPage.handle}: ${blockedBy.length}/${participants.length} participants have the current user blocked.`);
            throw new Error('You are blocked by one or more participants.');
        }

        // Does the current user have any of the participants blocked
        const blocked = await ctx.prisma?.block.findMany({
            where: {
                blocked: {
                    id: {
                        in: participants.map(({ id }) => id)
                    }
                },
                blocker: {
                    user: {
                        id: ctx.session.user?.id
                    }
                }
            }
        });

        // Log the blocked participants
        if (blocked.length > 0) {
            logger.error(`Failed to create message thread for ${currentPage.handle}: ${blocked.length}/${participants.length} participants are blocked by the current user.`);
            throw new Error('You have one or more participants blocked.');
        }

        // Create the message thread
        const messageThread = await ctx.prisma?.messageThread.create({
            data: {
                participants: {
                    connect: [...participants.map(({ id }) => ({ id })), { id: currentPage?.id }]
                }
            }
        });

        // Log the message thread
        logger.success(`Created message thread ${messageThread?.id} for ${currentPage.handle} with ${participants.length} participants.`);

        // Return the message thread
        return messageThread;
    }

    async sendMessage(ctx: PrivateServiceContext, input: z.infer<typeof SendMessageInput>) {
        const currentPage = await ctx.prisma?.page.findFirst({
            where: {
                user: {
                    id: ctx.session.user?.id
                },
            }
        });

        // Don't allow the current user to send a message unless they're a participant
        const thread = await ctx.prisma?.messageThread.findFirst({
            where: {
                id: input.threadId,
                participants: {
                    some: {
                        id: currentPage?.id
                    }
                }
            }
        });
        if (!thread) throw new Error('You are not a participant of this thread.');

        // Don't allow empty messages
        if (input.text.trim().length === 0) throw new Error('You cannot send an empty message.');

        // Don't allow messages over 1000 characters
        if (input.text.length > 1000) throw new Error('You cannot send a message over 1,000 characters.');

        // Create the message
        const message = await ctx.prisma?.message.create({
            data: {
                messageThread: {
                    connect: {
                        id: input.threadId
                    }
                },
                page: {
                    connect: {
                        userId: ctx.session.user?.id
                    }
                },
                text: input.text
            }
        });

        // Log the message
        logger.success(`Sent message ${message?.id} to message thread ${input.threadId} from ${ctx.session.user?.id}.`);

        // Return the message
        return message;
    }
}

export const messageService = new MessageService();
