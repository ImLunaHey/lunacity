import type { prisma } from '@app/server/db';
import { randomUUID } from 'crypto';
import createPrismaMock from 'prisma-mock';

describe('prisma-mock', () => {
    // See: https://github.com/demonsters/prisma-mock/issues/22
    it.failing('can be used to mock prisma', async () => {
        const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
        const userId1 = randomUUID();
        const userId2 = randomUUID();
        const userId3 = randomUUID();

        // Create a page and user
        await prismaMock.user.create({
            data: {
                id: userId1,
                page: {
                    create: {
                        id: randomUUID(),
                        handle: 'testuser1',
                        displayName: 'Test User 1',
                        ownerId: userId1,
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
                        ownerId: userId2,
                    },
                },
            },
        });

        // Create a third page and user
        await prismaMock.user.create({
            data: {
                id: userId3,
                page: {
                    create: {
                        id: randomUUID(),
                        handle: 'testuser3',
                        displayName: 'Test User 3',
                        ownerId: userId3,
                    },
                },
            },
        });

        // user3 blocks user2
        // If we comment this out it works as expected
        await prismaMock.block.create({
            data: {
                blocker: {
                    connect: {
                        userId: userId3,
                    },
                },
                blocked: {
                    connect: {
                        userId: userId2,
                    },
                },
                createdAt: new Date(2023, 1, 27, 1, 6, 45, 709),
            },
        });

        // Check if user1 is blocked by user2
        const blockedBy = await prismaMock.block.findMany({
            where: {
                blocked: {
                    id: userId1,
                },
                blocker: {
                    id: userId2,
                },
            },
            include: {
                blocked: true,
                blocker: true,
            },
        });

        // This should return an empty array since user1 is not blocked by user2
        // Instead it returns an array like this
        // [
        //     {
        //       "blocked": {
        //         "deactivatedTimestamp": null,
        //         "description": "",
        //         "displayName": "Test User 2",
        //         "followerCount": 0,
        //         "handle": "testuser2",
        //         "id": "550ac7d6-63c6-4b06-a693-d4258bd096de",
        //         "image": null,
        //         "official": false,
        //         "ownerId": "496f1985-ef8b-492a-aa8b-dc7dea07b44f",
        //         "userId": "496f1985-ef8b-492a-aa8b-dc7dea07b44f",
        //       },
        //       "blockedId": "550ac7d6-63c6-4b06-a693-d4258bd096de",
        //       "blocker": {
        //         "deactivatedTimestamp": null,
        //         "description": "",
        //         "displayName": "Test User 3",
        //         "followerCount": 0,
        //         "handle": "testuser3",
        //         "id": "8035bb4c-1112-49ae-b826-ee258cfa7a20",
        //         "image": null,
        //         "official": false,
        //         "ownerId": "34a691f3-2ed9-4b3f-b574-7dd32ca8c90f",
        //         "userId": "34a691f3-2ed9-4b3f-b574-7dd32ca8c90f",
        //       },
        //       "blockerId": "8035bb4c-1112-49ae-b826-ee258cfa7a20",
        //       "createdAt": 2023-02-26T14:36:45.709Z,
        //     },
        //   ]
        expect(blockedBy).toHaveLength(0);
    });
});
