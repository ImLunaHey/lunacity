import { messageService } from '@app/services/message-service';
import '@testing-library/jest-dom';
import { randomUUID } from 'crypto';
import createPrismaMock from 'prisma-mock/lib';
import { createMockSession } from '__tests__/__utils__/mocks/create-mock-session';

jest.mock('@app/env/server.mjs', () => ({
    env: {
        NODE_ENV: 'test',
        NEXTAUTH_URL: 'http://localhost:3000',
    },
}));

describe('messageService', () => {
    describe('getAllMessageThreads', () => {
        it('returns an empty list if the user has no message threads', async () => {
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await expect(messageService.getAllMessageThreads({
                prisma: prismaMock,
                session: createMockSession(),
            })).resolves.toStrictEqual([]);

            const messageThreads = await prismaMock.page.findMany();
            expect(messageThreads.length).toBe(0);
        });

        it('returns a list of message threads if the user has message threads', async () => {
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await prismaMock.messageThread.create({
                data: {
                    id: randomUUID(),
                    participants: {
                        create: [{
                            id: randomUUID(),
                            displayName: 'Test User',
                            handle: 'testuser',
                            owner: {
                                create: {
                                    id: randomUUID(),
                                },
                            },
                        }],
                    },
                },
            });

            const messageThreads = await messageService.getAllMessageThreads({
                prisma: prismaMock,
                session: createMockSession(),
            });

            expect(messageThreads.length).toBe(1);
            expect(messageThreads[0]).toHaveProperty('id');
            expect(messageThreads[0]).toHaveProperty('participants');
            expect(messageThreads[0]?.participants.length).toBe(1);
            expect(messageThreads[0]?.participants[0]?.handle).toBe('testuser');
        });
    });
});
