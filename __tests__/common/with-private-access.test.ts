import { getServerAuthSession } from '@app/server/auth';
import { withPrivateAccess } from '@app/common/with-private-access';

import type { IncomingMessage, ServerResponse } from 'http';

import '@testing-library/jest-dom';

jest.mock('@app/server/auth', () => ({
    getServerAuthSession: jest.fn(() => null)
}));

describe('withPrivateAccess', () => {
    it('redirects the user when not-authenticated', async () => {
        jest.mocked(getServerAuthSession).mockImplementation(() => new Promise(resolve => resolve(null)));

        const fn = withPrivateAccess();
        await expect(fn({
            req: {} as IncomingMessage & { cookies: Partial<{ [key: string]: string; }>; },
            res: {} as ServerResponse<IncomingMessage>,
            query: {},
            resolvedUrl: ''
        })).resolves.toStrictEqual({
            redirect: {
                destination: '/',
                permanent: false,
            }
        });
    });

    it('redirects to the "create page" page when the user has no user page', async () => {
        const sessionExpiration = new Date().toISOString();
        jest.mocked(getServerAuthSession).mockImplementation(() => new Promise(resolve => resolve({
            user: {
                id: '123'
            },
            expires: sessionExpiration
        })));

        const fn = withPrivateAccess();
        await expect(fn({
            req: {} as IncomingMessage & { cookies: Partial<{ [key: string]: string; }>; },
            res: {} as ServerResponse<IncomingMessage>,
            query: {},
            resolvedUrl: ''
        })).resolves.toStrictEqual({
            redirect: {
                destination: '/page/create',
                permanent: false,
            }
        });
    });

    it('renders the children elements when authenticated with a user page', async () => {
        const sessionExpiration = new Date().toISOString();
        jest.mocked(getServerAuthSession).mockImplementation(() => new Promise(resolve => resolve({
            user: {
                id: '123',
                page: {
                    id: '456',
                    handle: '',
                    image: '',
                    displayName: '',
                    followerCount: 0,
                    official: false,
                    description: '',
                    deactivatedTimestamp: null,
                    ownerId: '123',
                    userId: '123',
                }
            },
            expires: sessionExpiration
        })));

        const fn = withPrivateAccess();
        await expect(fn({
            req: {} as IncomingMessage & { cookies: Partial<{ [key: string]: string; }>; },
            res: {} as ServerResponse<IncomingMessage>,
            query: {},
            resolvedUrl: ''
        })).resolves.toStrictEqual({
            props: {
                session: {
                    expires: sessionExpiration,
                    user: {
                        id: '123',
                        page: {
                            id: '456',
                            handle: '',
                            image: '',
                            displayName: '',
                            followerCount: 0,
                            official: false,
                            description: '',
                            deactivatedTimestamp: null,
                            ownerId: '123',
                            userId: '123',
                        }
                    },
                },
            },
        });
    });
});
