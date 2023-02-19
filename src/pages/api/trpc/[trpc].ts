import { createNextApiHandler } from '@trpc/server/adapters/next';

import { env } from '@app/env/server.mjs';
import { createTRPCContext } from '@app/server/api/trpc';
import { appRouter } from '@app/server/api/root';
import { logger } from '@app/server/logger';

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === 'development'
      ? ({ path, error }) => {
        logger.error(
          `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
        );
      }
      : undefined,
});
