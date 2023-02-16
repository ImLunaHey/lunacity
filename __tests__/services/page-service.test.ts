import { pageService } from '@app/services/page-service';
import createPrismaMock from 'prisma-mock'
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
            }).rejects.toThrowError('Not signed in.');

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

    describe('getPageDetails', () => {
        it('throws error if no page exists with that handle', async () => {
            const session = createMockSession();
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await expect(async () => {
                await pageService.getPageDetails({
                    prisma: prismaMock,
                    session,
                }, {
                    handle: 'non-existant-handle'
                });
            }).rejects.toThrow('No page found for this handle.');
        });

        // Doesn't work yet as .aggregate needs to be implemented in prisma-mock
        // See: https://github.com/demonsters/prisma-mock/issues/17
        it.failing('returns page details', async () => {
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
            const pageDetails = await pageService.getPageDetails({
                prisma: prismaMock,
                session,
            }, {
                handle: 'staff'
            });

            expect(pageDetails).toStrictEqual(1);
        });
    });

    describe('getPageFollowing', () => {
        it('throws an error if no page exists with that handle', async () => {
            const session = createMockSession();
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await expect(async () => {
                await pageService.getPageFollowing({
                    prisma: prismaMock,
                    session,
                }, {
                    handle: 'non-existant-handle'
                });
            }).rejects.toThrow('No page found for this handle.');
        });

        it('returns an empty list if no one is following this page', async () => {
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
            const following = await pageService.getPageFollowing({
                prisma: prismaMock,
                session,
            }, {
                handle: 'staff'
            });

            expect(following).toStrictEqual([]);
        });

        it('returns a list of the pages following the page', async () => {
            const session = createMockSession();
            const pageId = randomUUID();
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await prismaMock.page.create({
                data: {
                    id: pageId,
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
                    },
                    following: {
                        create: {
                            followingId: pageId
                        }
                    }
                }
            });
            const following = await pageService.getPageFollowing({
                prisma: prismaMock,
                session,
            }, {
                handle: 'staff'
            });

            expect(following.length).toBe(1);
            expect(following[0]).toHaveProperty('createdAt');
            expect(following[0]).toHaveProperty('follower');
            expect(following[0]).toHaveProperty('followerId');
            expect(following[0]).toHaveProperty('following');
            expect(following[0]).toHaveProperty('followingId');
        });
    });

    describe('followPage', () => {
        it('throws an error if no page exists with that handle', async () => {
            const session = createMockSession();
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await expect(async () => {
                await pageService.followPage({
                    prisma: prismaMock,
                    session,
                }, {
                    handle: 'non-existant-handle'
                });
            }).rejects.toThrow('No page found for this handle.');
        });

        it('throws an error if the user is already following the page', async () => {
            const session = createMockSession();
            const pageId = randomUUID();
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await prismaMock.user.create({
                data: {
                    id: session.user.id,
                    handle: 'staff'
                }
            });
            await prismaMock.page.create({
                data: {
                    id: pageId,
                    handle: 'staff',
                    displayName: '@staff',
                    user: {
                        create: {
                            id: session.user.id,
                            handle: 'staff'
                        }
                    },
                    owner: {
                        connect: {
                            id: session.user.id,
                            handle: 'staff'
                        }
                    }
                }
            });
            await prismaMock.follows.create({
                data: {
                    followerId: pageId,
                    followingId: pageId,
                }
            });
            await expect(async () => {
                await pageService.followPage({
                    prisma: prismaMock,
                    session,
                }, {
                    handle: 'staff'
                });
            }).rejects.toThrow('You are already following this page.');
        });

        it('returns 200 OK if follow was sucessful', async () => {
            const session = createMockSession();
            const pageId = randomUUID();
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await prismaMock.user.create({
                data: {
                    id: session.user.id,
                    handle: 'staff'
                }
            });
            await prismaMock.page.create({
                data: {
                    id: pageId,
                    handle: 'staff',
                    displayName: '@staff',
                    user: {
                        create: {
                            id: session.user.id,
                            handle: 'staff'
                        }
                    },
                    owner: {
                        connect: {
                            id: session.user.id,
                            handle: 'staff'
                        }
                    }
                }
            });

            await expect(pageService.followPage({
                prisma: prismaMock,
                session,
            }, {
                handle: 'staff'
            })).resolves.toBe(undefined);
        });
    });

    describe('unfollowPage', () => {
        it('throws an error if no page exists with that handle', async () => {
            const session = createMockSession();
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await expect(async () => {
                await pageService.unfollowPage({
                    prisma: prismaMock,
                    session,
                }, {
                    handle: 'non-existant-handle'
                });
            }).rejects.toThrow('No page found for this handle.');
        });

        it('throws an error if the user is isn\'t following the page', async () => {
            const session = createMockSession();
            const pageId = randomUUID();
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await prismaMock.user.create({
                data: {
                    id: session.user.id,
                    handle: 'staff'
                }
            });
            await prismaMock.page.create({
                data: {
                    id: pageId,
                    handle: 'staff',
                    displayName: '@staff',
                    user: {
                        create: {
                            id: session.user.id,
                            handle: 'staff'
                        }
                    },
                    owner: {
                        connect: {
                            id: session.user.id,
                            handle: 'staff'
                        }
                    }
                }
            });
            await expect(async () => {
                await pageService.unfollowPage({
                    prisma: prismaMock,
                    session,
                }, {
                    handle: 'staff'
                });
            }).rejects.toThrow('You are not following this page.');
        });

        it('returns 200 OK if the unfollowing succeeded', async () => {
            const session = createMockSession();
            const pageId = randomUUID();
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await prismaMock.user.create({
                data: {
                    id: session.user.id,
                    handle: 'staff'
                }
            });
            await prismaMock.page.create({
                data: {
                    id: pageId,
                    handle: 'staff',
                    displayName: '@staff',
                    user: {
                        create: {
                            id: session.user.id,
                            handle: 'staff'
                        }
                    },
                    owner: {
                        connect: {
                            id: session.user.id,
                            handle: 'staff'
                        }
                    }
                }
            });
            await prismaMock.follows.create({
                data: {
                    followerId: pageId,
                    followingId: pageId,
                }
            });
            await expect(pageService.unfollowPage({
                prisma: prismaMock,
                session,
            }, {
                handle: 'staff'
            })).resolves.toBe(undefined);
        });
    });

    describe('getFollowingState', () => {
        it('returns false if the user is not following the page', async () => {
            const session = createMockSession();
            const pageId = randomUUID();
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await prismaMock.user.create({
                data: {
                    id: session.user.id,
                    handle: 'staff'
                }
            });
            await prismaMock.page.create({
                data: {
                    id: pageId,
                    handle: 'staff',
                    displayName: '@staff',
                    user: {
                        create: {
                            id: session.user.id,
                            handle: 'staff'
                        }
                    },
                    owner: {
                        connect: {
                            id: session.user.id,
                            handle: 'staff'
                        }
                    }
                }
            });
            await expect(pageService.getFollowingState({
                prisma: prismaMock,
                session,
            }, {
                handle: 'staff'
            })).resolves.toBe(false);
        });

        it('returns true if the user is following the page', async () => {
            const session = createMockSession();
            const pageId = randomUUID();
            const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
            await prismaMock.user.create({
                data: {
                    id: session.user.id,
                    handle: 'staff'
                }
            });
            await prismaMock.page.create({
                data: {
                    id: pageId,
                    handle: 'staff',
                    displayName: '@staff',
                    user: {
                        create: {
                            id: session.user.id,
                            handle: 'staff'
                        }
                    },
                    owner: {
                        connect: {
                            id: session.user.id,
                            handle: 'staff'
                        }
                    }
                }
            });
            await prismaMock.follows.create({
                data: {
                    followerId: pageId,
                    followingId: pageId,
                }
            });
            await expect(pageService.getFollowingState({
                prisma: prismaMock,
                session,
            }, {
                handle: 'staff'
            })).resolves.toBe(true);
        });
    });
});