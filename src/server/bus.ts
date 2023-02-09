import EventEmitter from 'events';
import TypedEmitter, { EventMap } from 'typed-emitter';
import { createClient } from 'redis';
import superjson from 'superjson';
import { Notification, NotificationData, Page, Post, User, Comment } from 'prisma/prisma-client';

export type BusEvents = {
    error: (error: Error) => void;
    newNotification: (notification: (Notification & {
        data: (NotificationData & {
            page: Page | null;
            post: Post | null;
            comment: Comment | null;
        }) | null;
        notified: User | null;
    }) | null) => void;
}

type ClientOptions = {
    clients: {
        pub?: ReturnType<typeof createClient>,
        sub?: ReturnType<typeof createClient>
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

class RedisBus<Events extends EventMap> extends (EventEmitter as { new <T extends EventMap>(): TypedEmitter<T> })<Events> {
    pub: ReturnType<typeof createClient>;
    sub: ReturnType<typeof createClient>;

    callbacks: Record<keyof Events, Events[keyof Events][]> = {} as Record<keyof Events, Events[keyof Events][]>;

    constructor(options: UrlOptions | CredentialsOptions | ClientOptions) {
        super();

        if (isClientOptions(options)) {
            this.pub = options.clients.pub ?? createClient();
            this.sub = options.clients.sub ?? createClient();
        } else if (isCredentialsOptions(options)) {
            this.pub = createClient({ username: options.credentials.username });
            this.sub = createClient({ username: options.credentials.username });
        } else if (isUrlOptions(options)) {
            this.pub = createClient({ url: options.url });
            this.sub = createClient({ url: options.url });
        } else {
            throw new Error('One of clients, credentials, or url must be provided.');
        }

        // @TODO: dont do this
        // These should have a .connect method
        this.pub.connect();
        this.sub.connect();
    }

    emit<Event extends keyof Events>(event: Event, ...args: Parameters<Events[Event]>) {
        // Publish to redis
        this.pub.publish(String(event), JSON.stringify(superjson.serialize(args)));

        // Publish to internal event bus
        return super.emit(event, ...args);
    }

    on<Event extends keyof Events>(event: Event, listener: Events[Event]) {
        // Save a copy of the listener for later
        if (!this.callbacks[event]) this.callbacks[event] = [];
        this.callbacks[event].push(listener);

        // If we sub twice just bail
        if (Object.keys(this.callbacks).length >= 2) return this;

        // Subscribe to the redis event
        this.sub.pSubscribe(String(event), (data) => {
            try {
                listener(superjson.parse<[Parameters<Events[Event]>, Event]>(data)[0]);
            } catch (error) {
                // @TODO: handle the error?
                console.log('Failed processing result from pSubscribe for %s', String(event), error);
            }
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

export const bus = new RedisBus<BusEvents>({ url: 'redis://localhost:6379' });
