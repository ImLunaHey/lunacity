import { generateUsername } from '@app/common/generate-username';
import type { User } from '@prisma/client';
import { randomUUID } from 'crypto';

export const createMockUser = (user?: Partial<User>) => ({
    deactivatedTimestamp: null,
    email: 'staff@example.com',
    emailVerified: new Date(),
    handle: generateUsername(),
    id: randomUUID(),
    image: '',
    pageId: randomUUID(),
    ...user,
} satisfies User);

