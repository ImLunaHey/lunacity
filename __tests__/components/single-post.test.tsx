import { SinglePost } from '@app/components/single-post';
import { render } from '@testing-library/react';

import '@testing-library/jest-dom';

import type { Media, Page, Post, Tag, User } from '@prisma/client';

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

describe('SinglePost', () => {
  const mockedPost = {
    type: 'text',
    body: '',
    communityLabel: 'EVERYONE',
    createdAt: new Date(),
    updatedAt: new Date(),
    id: '123',
    media: [],
    page: {
      id: '456',
      displayName: '@test-user',
      handle: 'test-user',
      deactivatedTimestamp: null,
      description: '',
      followerCount: 0,
      official: false,
      userId: '',
      ownerId: '123',
      owner: {
        id: '123',
        deactivatedTimestamp: null,
        email: '',
        emailVerified: new Date(),
        handle: '',
        image: '',
        pageId: '',
      },
    },
    pageId: '456',
    tags: [
      {
        id: '123',
        name: 'test-tag',
      },
    ],
    title: '',
  } satisfies
    | (Post & {
        page: Page & {
          owner: User;
        };
        media: Media[];
        tags: Tag[];
      })
    | null;

  it('renders nothing if this is an unsupported post type', () => {
    const { container } = render(
      <SinglePost
        post={{
          ...mockedPost,
          type: 'not-supported',
        }}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders nothing when there is no post data', () => {
    const { container } = render(<SinglePost post={null} />);
    expect(container).toMatchSnapshot();
  });

  it('renders a gallery post', () => {
    const { container } = render(
      <SinglePost
        post={{
          ...mockedPost,
          type: 'gallery',
        }}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders an image post', () => {
    const { container } = render(
      <SinglePost
        post={{
          ...mockedPost,
          type: 'image',
        }}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders a text post', () => {
    const { container } = render(
      <SinglePost
        post={{
          ...mockedPost,
          type: 'text',
        }}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders a video post', () => {
    const { container } = render(
      <SinglePost
        post={{
          ...mockedPost,
          type: 'video',
        }}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
