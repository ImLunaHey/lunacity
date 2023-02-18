import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

import Navbar from '@app/components/navbar';

import '@testing-library/jest-dom';

import type { Session } from 'next-auth';
import React from 'react';
import { replaceDynamicIds } from '../__utils__/replace-dynamic-ids';

// Mock next-auth with defaults
jest.mock('next/config', () => ({
  __esModule: true,
  default: () => ({
    publicRuntimeConfig: {
      APP_URL: 'http://localhost:3000',
      WS_URL: 'ws://localhost:3001',
    },
  }),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    asPath: '/',
  })),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((text: string) => text),
    ready: true,
  })),
}));

// Mock notifications component
jest.mock('../../src/components/notifications', () => ({
  __esModule: true,
  Notifications: () => <div>__NOTIFICATIONS__MOCK__</div>,
}));

describe('Navbar', () => {
  it('renders nothing when unauthenticated', () => {
    const { container } = render(
      <SessionProvider session={null}>
        <Navbar />
      </SessionProvider>
    );
    expect(container).toMatchSnapshot();
  });

  it('renders the navbar when authenticated', () => {
    const mockSession = {
      expires: '1',
      user: {
        id: '123',
        page: {
          id: '456',
          displayName: '@test-user',
          handle: 'test-user',
          image: '',
          deactivatedTimestamp: null,
          description: '',
          followerCount: 0,
          official: false,
          ownerId: '123',
          userId: '123',
        },
      },
    } satisfies Session;

    const { container } = render(
      <SessionProvider session={mockSession}>
        <Navbar />
      </SessionProvider>
    );
    expect(replaceDynamicIds(container)).toMatchSnapshot();
  });
});
