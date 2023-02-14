import { generateUsername } from '@app/common/generate-username';
import type { Page } from '@prisma/client';
import { randomUUID } from 'crypto';

export const createMockPage = (page?: Partial<Page>) => ({
    id: randomUUID(),
    deactivatedTimestamp: null,
    description: '',
    displayName: generateUsername(),
    followerCount: 0,
    handle: generateUsername(),
    official: false,
    ownerId: randomUUID(),
    userId: randomUUID(),
    ...page,
} satisfies Page);
