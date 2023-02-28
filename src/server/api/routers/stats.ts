import { env } from '@app/env.mjs';
import { createTRPCRouter, publicProcedure } from '@app/server/api/trpc';
import { logger } from '@app/server/logger';

type FetchError = {
    cause: {
        code: string;
        address: string;
    }
}

let lastCallTime: Date;
let cachedResponse = 0;
let stopPolling = false;
const getRealtimeUserCount = async () => {
    // If the user's DNS is blocking Plausible return the cached response
    if (stopPolling) return cachedResponse;

    try {
        // If it's been less than 10 seconds since the last call, return the cached response
        if (lastCallTime && lastCallTime.getTime() + 10_000 > new Date().getTime()) return cachedResponse;
        lastCallTime = new Date();

        const response = await fetch(`https://plausible.io/api/v1/stats/realtime/visitors?site_id=${env.PLAUSIBLE_SITE_ID}`, {
            headers: new Headers({
                Authorization: `Bearer ${env.PLAUSIBLE_KEY}`,
            }),
        });

        cachedResponse = Number(await response.text());

        return cachedResponse;
    } catch (error: unknown) {
        // If the user's DNS is blocking Plausible, stop polling
        if ((error as FetchError).cause.code === 'ECONNREFUSED' && ((error as FetchError).cause.address === '0.0.0.0' || (error as FetchError).cause.address === '127.0.0.1')) {
            logger.warn('Plausible is blocked by the user\'s DNS, stopped polling');
            stopPolling = true;
        }

        // If there's an error, return the cached response
        return cachedResponse;
    }
};

export const statsRouter = createTRPCRouter({
    getRealtimeUserCount: publicProcedure
        .query(() => {
            return getRealtimeUserCount();
        }),
});
