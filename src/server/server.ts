import 'dotenv/config';

import { createWebsocketContext } from '@app/server/api/trpc';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import http from 'http';
import next from 'next';
import { parse } from 'url';
import ws from 'ws';
import { appRouter } from './api/root';

const port = parseInt(process.env.PORT || '3001', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = http.createServer((req, res) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const parsedUrl = parse(req.url!, true);
        void handle(req, res, parsedUrl);
    });
    const wss = new ws.Server({ server });
    const handler = applyWSSHandler({
        wss,
        router: appRouter,
        async createContext(opts) {
            return createWebsocketContext(opts);
        }
    });

    process.on('SIGTERM', () => {
        console.log('SIGTERM');
        handler.broadcastReconnectNotification();
    });
    server.listen(port);

    // tslint:disable-next-line:no-console
    console.log(
        `> Server listening at http://localhost:${port} as ${dev ? 'development' : process.env.NODE_ENV
        }`,
    );
}).catch(error => {
    console.error('> Server crashed', error);
});
