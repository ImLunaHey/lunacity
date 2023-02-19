import { RedisBus } from '@app/server/bus';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('ioredis', () => jest.requireActual('ioredis-mock'));

jest.mock('@app/env/server.mjs', () => ({
    env: {
        NODE_ENV: 'test',
        NEXTAUTH_URL: 'http://localhost:3000',
    },
}));

describe('RedisBus', () => {
    it('throws an error if the correct args aren\'t passed', () => {
        expect(() => {
            // @ts-expect-error the test is checking for incorrect args
            new RedisBus(100);
        }).toThrowError('One of clients, credentials, or url must be provided.');
    });

    it('should be able to create an instance', () => {
        const bus = new RedisBus({ url: 'redis://localhost:6379' });

        expect(bus).toBeInstanceOf(RedisBus);
    });

    it('should be able to publish an event to Redis', async () => {
        expect.assertions(1);

        const bus = new RedisBus({ url: 'redis://localhost:6379' });

        const mockData = {
            userId: 'user123',
            notification: {
                data: {
                    page: null,
                    post: null,
                    comment: null,
                },
                notified: null,
            },
        };

        const mockEventName = 'newNotification';

        // Create a promise that resolves when an event is received
        const eventReceived = new Promise<void>((resolve) => {
            bus.on(mockEventName, (data) => {
                expect(data).toEqual(mockData);
                resolve();
            });
        });

        // Publish the event to Redis
        bus.emit(mockEventName, mockData);

        // Wait for the event to be received
        await eventReceived;
    });
});
