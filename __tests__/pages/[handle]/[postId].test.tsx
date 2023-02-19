import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostId, { getServerSideProps } from '@app/pages/[handle]/[postId]';
import createPrismaMock from 'prisma-mock';
import { randomUUID } from 'crypto';
import { createMockUser } from '__tests__/__utils__/mocks/create-mock-user';
import { createMockSession } from '__tests__/__utils__/mocks/create-mock-session';
import { api } from '@app/utils/api';
import type { IncomingMessage, ServerResponse } from 'http';

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

// Mock text-post component
jest.mock('@app/components/text-post', () => ({
  __esModule: true,
  TextPost: () => <div>__TEXT_POST__MOCK__</div>,
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((text: string, args) => (args ? `${text} ${JSON.stringify(args, null)}` : text)),
    ready: true,
  })),
}));

jest.mock('@app/utils/api', () => ({
  api: {
    post: {
      getPostDetails: {
        useQuery: jest.fn(() => ({
          isLoading: true,
          data: undefined,
        })),
      },
    },
  },
}));

jest.mock('@app/common/with-public-access', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
  withPublicAccess: (fn: any) => (ctx: any) => fn(ctx),
}));

describe('getServerSideProps', () => {
  it('returns the postId from the url', async () => {
    const postId = '1';
    const result = await getServerSideProps({
      query: {
        postId,
      },
      req: {} as IncomingMessage & { cookies: Partial<{ [key: string]: string }> },
      res: {} as ServerResponse<IncomingMessage>,
      resolvedUrl: '/',
    });
    expect(result).toEqual({
      props: {
        postId,
      },
    });
  });
});

describe('PostId', () => {
  it('throws an error when no postId is provided', () => {
    // @ts-expect-error - Mocking useQuery
    jest.mocked(api.post.getPostDetails.useQuery).mockImplementation(() => ({
      isLoading: false,
      data: null,
    }));

    const { container } = render(<PostId postId="" />);
    expect(container).toMatchSnapshot();
    expect(container.querySelector('h1')).toHaveTextContent('404');
    expect(container.querySelector('h2')).toHaveTextContent('errors.post.not-found.');
  });

  it('renders a loading state', () => {
    // @ts-expect-error - Mocking useQuery
    jest.mocked(api.post.getPostDetails.useQuery).mockImplementation(() => ({
      isLoading: true,
      data: null,
    }));

    const { container } = render(<PostId postId="1" />);
    expect(container).toMatchSnapshot();
    expect(container.querySelector('span')?.querySelector('span')).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders a post with the provided ID', async () => {
    const session = createMockSession();
    const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
    const post = await prismaMock.post.create({
      data: {
        id: '1',
        title: 'Test Post',
        body: 'This is a test post',
        createdAt: new Date(),
        updatedAt: new Date(),
        type: 'text',
        page: {
          create: {
            handle: 'staff',
            displayName: '@staff',
            owner: {
              create: {
                id: randomUUID(),
              },
            },
            moderators: {
              create: createMockUser({
                id: session.user.id,
              }),
            },
          },
        },
      },
    });

    // @ts-expect-error - Mocking useQuery
    jest.mocked(api.post.getPostDetails.useQuery).mockImplementation(() => ({
      isLoading: false,
      data: post,
    }));

    const { container } = render(<PostId postId={post.id} />);
    expect(container).toMatchSnapshot();
    expect(container.querySelector('div')).toHaveTextContent('__TEXT_POST__MOCK__');
  });
});
