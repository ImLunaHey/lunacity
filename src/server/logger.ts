import { env } from '@app/env.mjs';
import { Signale } from 'signale';

const secrets = Object.entries(env).filter(([key]) => !['NODE_ENV', 'NEXTAUTH_URL'].includes(key)).map(([, value]) => value).filter(Boolean);

export const logger = new Signale({
    secrets,
    scope: 'app',
});
