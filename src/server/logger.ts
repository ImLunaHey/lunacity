import type { env as envType } from '@app/env/server.mjs';
import { Signale } from 'signale';

const env: Partial<typeof envType> = process.env.SKIP_ENV_VALIDATION ? {} : await import('@app/env/server.mjs').then(pkg => pkg.env);

export const logger = new Signale({
    secrets: Object.entries(env).filter(([key]) => !['NODE_ENV', 'NEXTAUTH_URL'].includes(key)).map(([, value]) => value),
    scope: 'app',
});
