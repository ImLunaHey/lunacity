import { randomUUID } from 'crypto';
import { Session } from 'next-auth'

export const createMockSession = (session: Partial<Session> = {}) => ({
    expires: new Date(new Date().getTime() + (24 * 60) * 60000).toISOString(),
    user: {
        id: randomUUID(),
        ...session.user
    },
    ...session
} satisfies Session);