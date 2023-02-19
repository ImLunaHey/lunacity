import { env } from '@app/env/server.mjs';
import { Signale } from 'signale';

export const logger = new Signale({
    secrets: Object.entries(env).filter(([key]) => !['NODE_ENV', 'NEXTAUTH_URL'].includes(key)).map(([, value]) => value),
    scope: 'app',
});
