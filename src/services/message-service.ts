import type { PrivateServiceContext } from '@app/types/service';

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
}

export const messageService = new MessageService();
