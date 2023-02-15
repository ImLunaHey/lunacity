import Redis from 'ioredis';
import superjson from 'superjson';
import type { Notification, NotificationData, Page, Post, User, Comment } from 'prisma/prisma-client';

export type BusEvents = {
    newNotification: (data: {
        userId: string;
        notification: (Notification & {
            data: (NotificationData & {
                page: Page | null;
                post: Post | null;
                comment: Comment | null;
            }) | null;
            notified: User | null;
        }) | null;
    }) => void;
}

type ClientOptions = {
    clients: {
        pub?: Redis,
        sub?: Redis
    }
};

type CredentialsOptions = {
    credentials: {
        username: string;
        password?: string;
    };
};

type UrlOptions = {
    url: string;
};

type Options = UrlOptions | CredentialsOptions | ClientOptions;

const isCredentialsOptions = (options: Options): options is CredentialsOptions => Object.keys(options)[0] === 'credentials';
const isClientOptions = (options: Options): options is ClientOptions => Object.keys(options)[0] === 'client';
const isUrlOptions = (options: Options): options is UrlOptions => Object.keys(options)[0] === 'url';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class RedisBus<Events extends { [key: string]: (...args: any) => any; }> {
    pub: Redis;
    sub: Redis;

    callbacks: Record<keyof Events, Events[keyof Events][]> = {} as Record<keyof Events, Events[keyof Events][]>;

    constructor(options: UrlOptions | CredentialsOptions | ClientOptions) {
        if (isClientOptions(options)) {
            this.pub = options.clients.pub ?? new Redis();
            this.sub = options.clients.sub ?? new Redis();
        } else if (isCredentialsOptions(options)) {
            this.pub = new Redis({ username: options.credentials.username });
            this.sub = new Redis({ username: options.credentials.username });
        } else if (isUrlOptions(options)) {
            this.pub = new Redis(options.url);
            this.sub = new Redis(options.url);
        } else {
            throw new Error('One of clients, credentials, or url must be provided.');
        }
    }

    emit<Event extends keyof Events>(event: Event, ...args: Parameters<Events[Event]>) {
        // Publish to redis
        void this.pub.publish(String(event), JSON.stringify(superjson.serialize(args)));
    }

    on<Event extends keyof Events>(event: Event, listener: Events[Event]) {
        // Save a copy of the listener for later
        if (!this.callbacks[event]) this.callbacks[event] = [];
        this.callbacks[event].push(listener);

        // If we sub twice just bail
        if (Object.keys(this.callbacks).length >= 2) return this;

        // Subscribe to the redis event
        void this.sub.subscribe(String(event), (error, count) => {
            if (error) {
                // Just like other commands, subscribe() can fail for some reasons, ex network issues.
                console.error('Failed to subscribe: %s', error.message);
            } else {
                // `count` represents the number of channels this client are currently subscribed to.
                console.log(
                    `Subscribed successfully! This client is currently subscribed to ${count as number} channels.`
                );
            }
        });

        // When we get a message for this event call the corresponding handler
        // @TODO: raise a PR with ioredis to make this a typed eventEmitter
        this.sub.on('message', (channel: string, message: string) => {
            if (channel !== String(event)) return;
            listener(superjson.parse<[Parameters<Events[Event]>, Event]>(message)[0]);
        });

        return this;
    }

    off<E extends keyof Events>(event: E, listener: Events[E]) {
        // If no event is registered bail
        if (!this.callbacks[event]) return this;

        // Remove the listener from the callbacks list
        const index = this.callbacks[event].indexOf(listener);
        if (index > -1) this.callbacks[event].splice(index, 1);

        return this;
    }
}

export const bus = new RedisBus<BusEvents>({ url: process.env.REDIS_URL ?? 'redis://localhost:6379' });
