import '@testing-library/jest-dom';
import { api } from '@app/utils/api';
import Following, { getServerSideProps } from '../../../src/pages/[handle]/following';
import type { IncomingMessage, ServerResponse } from 'http';
import { render } from '@testing-library/react';

jest.mock('@app/common/with-public-access', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
  withPublicAccess: (fn: any) => (ctx: any) => fn(ctx),
}));

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

jest.mock('@app/utils/api', () => ({
  api: {
    page: {
      getPageFollowing: {
        useQuery: jest.fn(() => ({
          isLoading: true,
          data: undefined,
        })),
      },
    },
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((text: string, args) => (args ? `${text} ${JSON.stringify(args, null)}` : text)),
    ready: true,
  })),
}));

describe('getServerSideProps', () => {
  it('returns the handle from the url', async () => {
    const handle = '@staff';
    const result = await getServerSideProps({
      query: {
        handle,
      },
      req: {} as IncomingMessage & { cookies: Partial<{ [key: string]: string }> },
      res: {} as ServerResponse<IncomingMessage>,
      resolvedUrl: '/',
    });
    expect(result).toEqual({
      props: {
        handle: 'staff',
      },
    });
  });

  it('renders the following page', () => {
    // @ts-expect-error - Mocking useQuery
    jest.mocked(api.page.getPageFollowing.useQuery).mockImplementation(() => ({
      isLoading: false,
      data: [],
    }));

    const { container } = render(<Following handle={'staff'} />);
    expect(container).toMatchSnapshot();
  });
});
