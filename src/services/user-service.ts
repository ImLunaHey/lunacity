import type { PrivateServiceContext } from '@app/types/service';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const UpdateSettingsInput = z.object({
    handle: z.string().optional(),
    displayName: z.string().optional()
});

class UserService {
    async getAllPosts(ctx: PrivateServiceContext) {
        // Get the current user's page
        const userPage = await ctx.prisma.page.findUnique({
            where: {
                userId: ctx.session.user.id
            }
        });

        // No page found for the current session
        if (!userPage)
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'No page found for your session.',
            });

        // Authenticated user
        const posts = await ctx.prisma.post.findMany({
            where: {
                page: {
                    followedBy: {
                        some: {
                            followerId: userPage.id,
                        },
                    },
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
    }

    async updateSettings(ctx: PrivateServiceContext, input: z.infer<typeof UpdateSettingsInput>) {
        // If they're trying to update their handle check its not in use
        if (input.handle) {
            const existingPageWithHandle = await ctx.prisma.page.findUnique({
                where: {
                    handle: input.handle
                }
            });

            // Don't allow a user to update their handle to one that's already in use
            if (existingPageWithHandle) throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'That handle is already in use.'
            });
        }

        // Update the user's page
        // TODO: Support changing the user's email
        await ctx.prisma.user.update({
            where: {
                id: ctx.session.user.id
            },
            data: {
                page: {
                    update: {
                        handle: input.handle,
                        displayName: input.displayName,
                    }
                }
            }
        });
    }

    async deactivateAccount(ctx: PrivateServiceContext) {
        await ctx.prisma.user.update({
            where: {
                id: ctx.session.user.id
            },
            data: {
                deactivatedTimestamp: new Date()
            }
        });
    }
}

export const userService = new UserService();
