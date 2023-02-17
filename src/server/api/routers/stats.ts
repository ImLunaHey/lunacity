import { env } from '@app/env/server.mjs';
import { createTRPCRouter, publicProcedure } from '../trpc';

let lastCallTime: Date;
let cachedResponse: number;
const getRealtimeUserCount = async () => {
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
};

export const statsRouter = createTRPCRouter({
    getRealtimeUserCount: publicProcedure
        .query(() => {
            return getRealtimeUserCount();
        }),
});