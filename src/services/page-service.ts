import { bus } from '@app/server/bus';
import type { PrivateServiceContext, PublicServiceContext } from '@app/types/service';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const CreatePageInput = z.object({
    handle: z.string(),
    displayName: z.string().optional(),
    description: z.string().optional(),
});

export const PageExistsInput = z.object({
    handle: z.string(),
});

export const GetPageDetailsInput = z.object({
    handle: z.string(),
});

export const GetPageFollowingInput = z.object({
    handle: z.string(),
});

export const GetPagePostsInput = z.object({
    handle: z.string(),
});

export const FollowPageInput = z.object({
    handle: z.string(),
});

export const UnfollowPageInput = z.object({
    handle: z.string(),
});

export const FollowingStateInput = z.object({
    handle: z.string()
});

class PageService {
    async createPage(ctx: PrivateServiceContext, input: z.infer<typeof CreatePageInput>) {
        // The handle must be at least 1 character long
        if (input.handle.trim().length === 0)
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'The handle must be at least 1 character long.',
            });

        // The handle must be no more than 25 characters long
        if (input.handle.trim().length >= 26)
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'The handle must be no more than 25 character long.',
            });

        // The handle must not be any of these reserved words
        if (
            [
                'null',
                'undefined',
                'signin',
                'signout',
                'signup',
                'tos',
                ...'abcdefghijklmnopqrstuvwxyz',
                ...'abcdefghijklmnopqrstuvwxyz'.toUpperCase(),
            ].includes(input.handle)
        )
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message:
                    'This handle is reserved, please contact @staff if you have a valid use case.',
            });

        // Check if the handle is taken
        const handleTaken =
            (await ctx.prisma.page.count({ where: { handle: input.handle } }) ?? 0) >= 1;
        if (handleTaken)
            throw new TRPCError({
                code: 'CONFLICT',
                message: `The handle "@${input.handle}" is taken.`,
            });

        // Create the page
        const page = await ctx.prisma.page.create({
            data: {
                displayName: input.displayName?.trim() || `@${input.handle}`,
                handle: input.handle,
                description: input.description,
                owner: {
                    connect: {
                        id: ctx.session?.user?.id,
                    }
                },
                // If this user doesn't have a user page assign this new page as it
                ...(
                    !ctx.session.user.page ? {
                        user: {
                            connect: {
                                id: ctx.session.user.id,
                            },
                        },
                    } : {}
                ),
            },
        });

        // Make page follow itself
        await ctx.prisma.follows.create({
            data: {
                followerId: page.id,
                followingId: page.id
            }
        });
    }

    async pageExists(ctx: PublicServiceContext, input: z.infer<typeof PageExistsInput>) {
        const count = await ctx.prisma?.page.count({
            where: { handle: input.handle.replace('@', '') },
        });
        return (count ?? 0) >= 1;
    }

    getUsersPages(ctx: PrivateServiceContext) {
        // TODO: make this error more descriptive
        if (!ctx.session.user) throw new Error('Not signed in.');

        return ctx.prisma?.page.findMany({
            where: {
                OR: [{
                    ownerId: ctx.session.user.id,
                }, {
                    moderators: {
                        some: {
                            id: ctx.session.user.id
                        }
                    }
                }]
            },
        });
    }

    async getPageDetails(ctx: PublicServiceContext, input: z.infer<typeof GetPageDetailsInput>) {
        const handle = input.handle.replace('@', '');

        // Get page details
        const page = await ctx.prisma.page.findFirst({
            where: {
                handle,
            },
            include: {
                // Get all infractions that end AFTER now
                infractions: {
                    where: {
                        endTimestamp: {
                            gte: new Date(),
                        },
                    },
                }
            },
        });

        // No page found for that handle
        if (!page)
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'No page found for this handle.',
            });

        // If the user is signed in, check if the user's own page is following this page
        const following = ctx.session?.user ? await ctx.prisma.page.findFirst({
            where: {
                handle, followedBy: {
                    some: {
                        follower: {
                            userId: ctx.session?.user.id
                        }
                    }
                }
            }
        }).then(following => following !== null) : false;

        // How many pages this page is following
        const followingCount = ctx.session?.user ? await ctx.prisma.follows.aggregate({
            where: {
                followerId: page?.id
            },
            _count: true
        }).then(result => result._count) : 0;

        // How many pages this page has following it
        const followerCount = ctx.session?.user ? await ctx.prisma.follows.aggregate({
            where: {
                followingId: page?.id
            },
            _count: true
        }).then(result => result._count) : 0;

        return {
            ...page,
            following,
            followingCount,
            followerCount,
        }
    }

    async getPageFollowing(ctx: PublicServiceContext, input: z.infer<typeof GetPageFollowingInput>) {
        const handle = input.handle.replace('@', '');

        // Check page exists
        const page = await ctx.prisma.page.findFirst({
            where: {
                handle,
            }
        });

        // No page found for that handle
        if (!page)
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'No page found for this handle.',
            });

        // Get a list of pages who follow this page
        return ctx.prisma.follows.findMany({
            where: {
                following: {
                    handle
                }
            },
            include: {
                follower: true,
                following: true
            },
            orderBy: [{
                createdAt: 'asc'
            }]
        });
    }

    async getPagePosts(ctx: PublicServiceContext, input: z.infer<typeof GetPagePostsInput>) {
        const handle = input.handle.replace('@', '');

        // Get all the posts for this page
        const posts = await ctx.prisma.post.findMany({
            where: {
                page: {
                    handle,
                },
            },
            include: {
                tags: true,
                page: {
                    include: {
                        owner: true,
                        _count: {
                            select: {
                                followedBy: true,
                                following: true,
                            }
                        }
                    },
                },
                media: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Return the posts with the follower and following counts
        return posts.map(post => {
            const { _count, ...page } = post.page;
            return {
                ...post,
                page: {
                    ...page,
                    followerCount: _count.followedBy,
                    followingCount: _count.following,
                }
            };
        });

        // // If the user is signed in check if they have permission to get more posts, if they don't then return public post
        // if (page?.ownerId !== session.user.id) return posts;

        // // If the user is the owner return more details
        // // TODO: The comment above
        // return page;
    }

    async followPage(ctx: PrivateServiceContext, input: z.infer<typeof FollowPageInput>) {
        // Get the page
        const pageToFollow = await ctx.prisma.page.findUnique({
            where: {
                handle: input.handle,
            },
            include: {
                owner: true
            }
        });

        // No page found for that handle
        if (!pageToFollow)
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'No page found for this handle.',
            });

        // Get the current session's page
        const sessionUserPage = await ctx.prisma.page.findUnique({
            where: {
                userId: ctx.session.user?.id
            }
        });

        // No page found for the current session's user
        if (!sessionUserPage)
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'No user page found for this handle.',
            });

        const alreadyFollowing = await ctx.prisma.follows.findFirst({
            where: {
                followerId: sessionUserPage.id,
                followingId: pageToFollow.id
            }
        });

        // Already following this page
        if (alreadyFollowing)
            throw new TRPCError({
                code: 'CONFLICT',
                message: 'You are already following this page.',
            });

        // Follow the page and send a notification to the page they followed
        const [, { id }] = await ctx.prisma.$transaction([
            ctx.prisma.page.update({
                where: { handle: input.handle },
                data: {
                    followedBy: {
                        create: {
                            followerId: sessionUserPage.id,
                        },
                    },
                },
            }),
            ctx.prisma.notification.create({
                data: {
                    type: 'FOLLOWED',
                    notified: {
                        connect: {
                            id: pageToFollow.owner.id
                        }
                    },
                    data: {
                        create: {
                            pageId: sessionUserPage.id
                        }
                    }
                }
            })
        ]);

        // Get the newly created notification
        const notification = await ctx.prisma.notification.findUnique({
            where: {
                id
            },
            include: {
                data: {
                    include: {
                        comment: true,
                        page: true,
                        post: true,
                    }
                },
                notified: true
            }
        });

        bus.emit('newNotification', {
            userId: pageToFollow.owner.id,
            notification
        });
    }

    async unfollowPage(ctx: PrivateServiceContext, input: z.infer<typeof UnfollowPageInput>) {
        // Get the page
        const page = await ctx.prisma.page.findUnique({
            where: {
                handle: input.handle,
            },
        });

        // No page found for that handle
        if (!page)
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'No page found for this handle.',
            });

        // Get the current session's page
        const userPage = await ctx.prisma.page.findFirst({
            where: {
                userId: ctx.session.user?.id
            }
        });

        // No page found for the current session
        if (!userPage)
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'No page found for this handle.',
            });

        // Get the following
        const isFollowing = await ctx.prisma.follows.findFirst({
            where: {
                followerId: userPage.id,
                followingId: page.id
            },
        });

        // Check if the user is following this page
        if (!isFollowing)
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'You are not following this page.',
            });

        // Unfollow the page
        await ctx.prisma.follows.delete({
            where: {
                followerId_followingId: {
                    followerId: userPage.id,
                    followingId: page.id
                },
            },
        });
    }

    async getFollowingState(ctx: PrivateServiceContext, input: z.infer<typeof FollowingStateInput>) {
        // Get the current session's page
        const userPage = await ctx.prisma.page.findFirst({
            where: {
                userId: ctx.session.user?.id
            }
        });

        // No page found for the current session
        if (!userPage)
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'No page found for this handle.',
            });

        // Get the page
        const page = await ctx.prisma.page.findUnique({
            where: {
                handle: input.handle,
            },
        });

        // No page found for that handle
        if (!page)
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'No page found for this handle.',
            });

        // Check if the session user's page is following the handle provided
        const follows = await ctx.prisma.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userPage.id,
                    followingId: page.id
                }
            }
        });

        return follows !== null;
    }
}

export const pageService = new PageService();