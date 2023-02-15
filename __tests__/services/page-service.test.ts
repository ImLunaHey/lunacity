import { pageService } from '@app/services/page-service';
import createPrismaMock from "prisma-mock"
import '@testing-library/jest-dom';
import { createMockSession } from '__tests__/__utils__/mocks/create-mock-session';
import { generateUsername } from '@app/common/generate-username';
import { randomUUID } from 'crypto';
import { createMockUser } from '__tests__/__utils__/mocks/create-mock-user';

describe('pageService', () => {
    describe('createPage', () => {
        it('throws an error if the handle is too short', async () => {
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await expect(async () => {
                await pageService.createPage(
                    {
                        prisma: prismaMock,
                        session: createMockSession(),
                    },
                    {
                        handle: '',
                        displayName: `@${generateUsername()}`,
                        description: 'test 123'
                    }
                );
            }).rejects.toThrowError('The handle must be at least 1 character long.');
        });

        it('throws an error if the handle is too long', async () => {
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await expect(async () => {
                await pageService.createPage(
                    {
                        prisma: prismaMock,
                        session: createMockSession(),
                    },
                    {
                        handle: '123456789123456789123456789',
                        displayName: `@${generateUsername()}`,
                        description: 'test 123'
                    }
                );
            }).rejects.toThrowError('The handle must be no more than 25 character long.');
        });

        it('throws an error if the handle is a reserved word/character', async () => {
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await expect(async () => {
                await pageService.createPage(
                    {
                        prisma: prismaMock,
                        session: createMockSession(),
                    },
                    {
                        handle: 'null',
                        displayName: `@${generateUsername()}`,
                        description: 'test 123'
                    }
                );
            }).rejects.toThrowError('This handle is reserved, please contact @staff if you have a valid use case.');
        });

        it('throws an error if the handle is taken', async () => {
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>({
                page: [{
                    handle: 'staff'
                }]
            });
            await expect(async () => {
                await pageService.createPage(
                    {
                        prisma: prismaMock,
                        session: createMockSession(),
                    },
                    {
                        handle: 'staff',
                        displayName: `@${generateUsername()}`,
                        description: 'test 123'
                    }
                );
            }).rejects.toThrowError('The handle \"@staff\" is taken.');
        });

        it('creates a page when all details are supplied', async () => {
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await expect(pageService.createPage(
                {
                    prisma: prismaMock,
                    session: createMockSession(),
                },
                {
                    handle: 'staff',
                    displayName: `@${generateUsername()}`,
                    description: 'test 123'
                }
            )).resolves.toBe(undefined);

            const pages = await prismaMock.page.findMany();
            expect(pages.length).toBe(1);
            expect(pages[0]?.handle).toBe('staff');
        });

        it('uses @handle for the default displayName', async () => {
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await expect(pageService.createPage(
                {
                    prisma: prismaMock,
                    session: createMockSession(),
                },
                {
                    handle: 'staff',
                    description: 'test 123'
                }
            )).resolves.toBe(undefined);

            const pages = await prismaMock.page.findMany();
            expect(pages.length).toBe(1);
            expect(pages[0]?.displayName).toBe('@staff');
        });
    });

    describe('pageExists', () => {
        it('returns false for non-existant pages', async () => {
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await expect(pageService.pageExists(
                {
                    prisma: prismaMock,
                    session: createMockSession(),
                },
                {
                    handle: 'non-existant-page'
                }
            )).resolves.toBe(false);

            const pages = await prismaMock.page.findMany();
            expect(pages.length).toBe(0);
        });

        it('returns true for pages that exist', async () => {
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>({
                page: [{
                    handle: 'staff'
                }]
            });
            await expect(pageService.pageExists({
                prisma: prismaMock,
                session: createMockSession(),
            }, {
                handle: 'staff'
            })).resolves.toBe(true);

            const pages = await prismaMock.page.findMany();
            expect(pages.length).toBe(1);
        });
    });

    describe('getUsersPages', () => {
        it('throws an error if your session doesnt contain a user', async () => {
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>({
                page: [{
                    handle: 'staff'
                }]
            });
            await expect(async () => {
                await pageService.getUsersPages({
                    prisma: prismaMock,
                    session: createMockSession({ user: undefined }),
                });
            }).rejects.toThrowError('A session is required to find your pages.');

            const pages = await prismaMock.page.findMany();
            expect(pages.length).toBe(1);
        });

        it('returns pages the user is an owner of', async () => {
            const session = createMockSession();
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>({
                page: [{
                    ownerId: session.user.id,
                    handle: 'staff'
                }]
            });
            await expect(pageService.getUsersPages({
                prisma: prismaMock,
                session,
            })).resolves.toStrictEqual([{
                handle: 'staff',
                ownerId: session.user.id
            }]);

            const pages = await prismaMock.page.findMany();
            expect(pages.length).toBe(1);
        });

        it('returns pages the user is an moderator of', async () => {
            const session = createMockSession();
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await prismaMock.page.create({
                data: {
                    handle: 'staff',
                    displayName: '@staff',
                    owner: {
                        create: {
                            id: randomUUID()
                        }
                    },
                    moderators: {
                        create: createMockUser({
                            id: session.user.id
                        })
                    }
                }
            });

            const userPages = await pageService.getUsersPages({
                prisma: prismaMock,
                session,
            });
            expect(userPages.length).toBe(1);
            expect(userPages[0]?.handle).toBe('staff');
        });
    });
});