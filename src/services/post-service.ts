import { shuffleArray } from '@app/common/shuffle-array';
import type { PrivateServiceContext, PublicServiceContext } from '@app/types/service';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const CreatePostInput = z.object({
    // Which page to make the post on
    page: z.object({
        handle: z.string(),
    }),
    post: z.union([
        z.object({
            title: z.string(),
            type: z.literal('text'),
            tags: z.array(z.string()),
            body: z.string().optional(),
        }),
        z.object({
            title: z.string(),
            type: z.literal('image'),
            tags: z.array(z.string()),
            body: z.never(),
        }),
    ]),
});

export const GetPostDetailsInput = z.object({
    postId: z.string(),
});

export const GetExplorePostsInput = z.object({
    publicCursor: z.string().optional(),
    personalCursor: z.string().optional(),
}).optional();

class PostService {
    async createPost(ctx: PrivateServiceContext, input: z.infer<typeof CreatePostInput>) {
        const page = await ctx.prisma.page.findUnique({
            where: {
                handle: input.page.handle,
            },
        });

        // If we have no page throw
        if (!page) throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No page found for that handle.',
        });

        // Post title is too short
        if (input.post.title.trim().length === 0) throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Post title is too short.',
        });

        // Create the post
        await ctx.prisma.post.create({
            data: {
                pageId: page.id,
                type: input.post.type,
                body: input.post.body,
                title: input.post.title,
                tags: {
                    connectOrCreate: input.post.tags.map((tag) => {
                        return {
                            where: { name: tag },
                            create: { name: tag },
                        };
                    }),
                },
            },
        });
    }

    async getPostDetails(ctx: PublicServiceContext, input: z.infer<typeof GetPostDetailsInput>) {
        // Get post details
        const post = await ctx.prisma.post.findFirst({
            where: {
                id: input.postId,
            },
            include: {
                page: {
                    include: {
                        owner: true,
                    },
                },
                media: true,
                tags: true,
            },
        });

        // If the user is signed out return public details
        if (!ctx.session?.user?.id) return post;

        // If the user is signed in check if they have permission to get more details, if they don't then return public details
        if (post?.page?.ownerId !== ctx.session.user.id) return post;

        // If the user is the owner return more details
        // TODO: The comment above
        return post;
    }

    async getExplorePosts(ctx: PublicServiceContext, input: z.infer<typeof GetExplorePostsInput>) {
        // If there's no cursor then return 0 + 50 new
        // If there is a cursor return cursor + 50 new
        //  Get 50 posts from pages that're SFW
        const publicRecommendations = await ctx.prisma.post.findMany({
            take: 50,
            ...(input?.publicCursor
                ? {
                    cursor: {
                        id: input?.publicCursor,
                    },
                }
                : {}),
            where: {
                communityLabel: {
                    equals: 'EVERYONE',
                },
            },
            include: {
                tags: true,
                page: {
                    include: {
                        owner: true,
                    },
                },
                media: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        }) ?? [];

        // Authenticated user
        // Return explore + personal
        if (ctx.session?.user) {
            const pages = await ctx.prisma?.post.findMany({
                where: {
                    page: {
                        followedBy: {
                            some: {
                                followerId: ctx.session.user.id,
                            },
                        },
                    },
                },
                select: {
                    tags: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }) ?? [];

            // Get the ID for every tag
            const tagIds = pages.reduce(
                (tags, page) => [...tags, ...page.tags.map((tag) => tag.id)],
                [] as string[]
            );

            // Get posts with tags
            const personalRecommendations = await ctx.prisma?.post.findMany({
                take: 50,
                ...(input?.personalCursor
                    ? {
                        cursor: {
                            id: input?.personalCursor,
                        },
                    }
                    : {}),
                where: {
                    page: {
                        followedBy: {
                            some: {
                                followerId: ctx.session.user.id,
                            },
                        },
                    },
                    tags: {
                        every: {
                            name: {
                                in: tagIds,
                            },
                        },
                    },
                },
                include: {
                    tags: true,
                    page: {
                        include: {
                            owner: true,
                        },
                    },
                    media: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }) ?? [];

            // Authenticated user
            return {
                posts: shuffleArray([...personalRecommendations, ...publicRecommendations]),
                personalCursor: personalRecommendations[49]?.id,
                publicCursor: publicRecommendations[49]?.id,
            };
        }

        // Unauthenticated user
        return {
            posts: shuffleArray(publicRecommendations),
            publicCursor: publicRecommendations[49]?.id,
        };
    }

}

export const postService = new PostService();
