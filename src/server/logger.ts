import pino from 'pino';

// create pino logger
export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
});
