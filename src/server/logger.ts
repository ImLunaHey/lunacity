import { Signale } from 'signale';
import { env } from '@app/env/server.mjs';

export const logger = new Signale({
    secrets: Object.entries(env).filter(([key]) => !['NODE_ENV', 'NEXTAUTH_URL'].includes(key)).map(([, value]) => value),
    scope: 'app',
});
