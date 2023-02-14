import type { Post } from '@prisma/client';
import { randomUUID } from 'crypto';

export const createMockPost = (post?: Partial<Post>) => ({
    id: randomUUID(),
    type: 'text',
    title: 'Test Post',
    body: '',
    pageId: randomUUID(),
    communityLabel: 'EVERYONE',
    updatedAt: new Date(),
    createdAt: new Date(),
    ...post,
} satisfies Post);
