import { withPublicAccess } from '@app/common/with-public-access';
import { getSession } from 'next-auth/react';

import type { IncomingMessage, ServerResponse } from 'http';

import '@testing-library/jest-dom';

jest.mock('next-auth/react');

describe('withPublicAccess', () => {
    it('redirects the user when not-authenticated', async () => {
        jest.mocked(getSession).mockImplementation(() => new Promise(resolve => resolve(null)));

        const fn = withPublicAccess();
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

    it('renders the children elements when authenticated', async () => {
        const sessionExpiration = new Date().toISOString();
        jest.mocked(getSession).mockImplementation(() => new Promise(resolve => resolve({
            user: {
                id: '123'
            },
            expires: sessionExpiration
        })));

        const fn = withPublicAccess();
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
                    },
                },
            },
        });
    });
});
