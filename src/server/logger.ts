import pino from 'pino';
import { createPinoBrowserSend, createWriteStream } from 'pino-logflare';

const API_KEY = '65qAvnU2wYOp';
const SOURCE_TOKEN = '6a20a6ad-db4b-477f-a9df-3327c6d3965e';

// create pino-logflare stream
const stream = createWriteStream({
    apiKey: API_KEY,
    sourceToken: SOURCE_TOKEN
});

// create pino-logflare browser stream
const send = createPinoBrowserSend({
    apiKey: API_KEY,
    sourceToken: SOURCE_TOKEN
});

// create pino logger
export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    browser: {
        transmit: {
            send: send,
        }
    }
}, stream);
