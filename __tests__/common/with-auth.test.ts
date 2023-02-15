import { withPrivateAccess } from '@app/common/with-private-access';
import { getSession } from 'next-auth/react';

import type { IncomingMessage, ServerResponse } from 'http';

import '@testing-library/jest-dom';

jest.mock('next-auth/react');

describe('withPrivateAccess', () => {
    it('redirects the user when not-authenticated', async () => {
        jest.mocked(getSession).mockImplementation(() => new Promise(resolve => resolve(null)));

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

    it('renders the children elements when authenticated', async () => {
        jest.mocked(getSession).mockImplementation(() => new Promise(resolve => resolve({
            user: {
                id: '123'
            },
            expires: new Date().toISOString()
        })));

        const fn = withPrivateAccess();
        await expect(fn({
            req: {} as IncomingMessage & { cookies: Partial<{ [key: string]: string; }>; },
            res: {} as ServerResponse<IncomingMessage>,
            query: {},
            resolvedUrl: ''
        })).resolves.toStrictEqual({
            props: {}
        });
    });
});
