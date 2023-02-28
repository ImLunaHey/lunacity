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

describe.skip('messageService', () => {
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

    describe('createMessageThread', () => {
        it('throws an error if one or more participants do not exist', async () => {
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await expect(messageService.createMessageThread({
                prisma: prismaMock,
                session: createMockSession(),
            }, {
                participants: ['testuser'],
            })).rejects.toThrow('One or more participants do not exist');
        });

        it('throws an error if the current user is blocked by one or more participants', async () => {
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            const userId1 = randomUUID();
            const userId2 = randomUUID();

            // Create a page and user
            await prismaMock.user.create({
                data: {
                    id: userId1,
                    page: {
                        create: {
                            id: randomUUID(),
                            handle: 'testuser',
                            displayName: 'Test User',
                            ownerId: userId1
                        },
                    },
                },
            });

            // Create a second page and user
            await prismaMock.user.create({
                data: {
                    id: userId2,
                    page: {
                        create: {
                            id: randomUUID(),
                            handle: 'testuser2',
                            displayName: 'Test User 2',
                            ownerId: userId2
                        }
                    }
                }
            });

            // Using the first user block the second
            await prismaMock.block.create({
                data: {
                    blocker: {
                        connect: {
                            userId: userId1,
                        },
                    },
                    blocked: {
                        connect: {
                            userId: userId2,
                        },
                    },
                },
            });

            // Try to create a message thread with the second user
            await expect(messageService.createMessageThread({
                prisma: prismaMock,
                session: createMockSession({
                    user: {
                        id: userId2,
                    }
                }),
            }, {
                participants: ['testuser'],
            })).rejects.toThrow('You are blocked by one or more participants.');
        });

        it.failing('throws an error if one or more participants are blocked by the current user', async () => {
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            const userId1 = randomUUID();
            const userId2 = randomUUID();

            // Create a page and user
            await prismaMock.user.create({
                data: {
                    id: userId1,
                    page: {
                        create: {
                            id: randomUUID(),
                            handle: 'testuser',
                            displayName: 'Test User',
                            ownerId: userId1
                        },
                    },
                },
            });

            // Create a second page and user
            await prismaMock.user.create({
                data: {
                    id: userId2,
                    page: {
                        create: {
                            id: randomUUID(),
                            handle: 'testuser2',
                            displayName: 'Test User 2',
                            ownerId: userId2
                        }
                    }
                }
            });

            // Using a random user block the second
            await prismaMock.block.create({
                data: {
                    blocker: {
                        create: {
                            userId: randomUUID(),
                            handle: 'randomuser3'
                        },
                    },
                    blocked: {
                        connect: {
                            userId: userId2,
                        },
                    },
                },
            });

            // Try to create a message thread with the second user
            await expect(messageService.createMessageThread({
                prisma: prismaMock,
                session: createMockSession({
                    user: {
                        id: userId1,
                    }
                }),
            }, {
                participants: ['testuser2'],
            })).rejects.toThrow('You have one or more participants blocked.');
        });

        // it('creates a message thread with the given participants', async () => {
        //     const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
        //     await messageService.createMessageThread({
        //         prisma: prismaMock,
        //         session: createMockSession(),
        //     }, {
        //         participants: ['testuser'],
        //     });

        //     const messageThreads = await prismaMock.messageThread.findMany();
        //     expect(messageThreads.length).toBe(1);
        //     expect(messageThreads[0].participants.length).toBe(1);
        //     expect(messageThreads[0].participants[0].handle).toBe('testuser');
        // });
    });
});
