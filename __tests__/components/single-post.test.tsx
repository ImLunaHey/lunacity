import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SinglePost } from '@app/components/single-post';
import { Media, Page, Post, Tag, User } from '@prisma/client';

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

// Mock notifications component
jest.mock('../../src/components/text-post', () => ({
  __esModule: true,
  TextPost: () => <div>__TEXT_POST__MOCK__</div>,
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

  it('it doesnt render when there is no post data', () => {
    const { container } = render(<SinglePost post={null} />);
    expect(container).toMatchSnapshot();
  });

  it('it renders a gallery post', () => {
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

  it('it renders an image post', () => {
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

  it('it renders a text post', () => {
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

  it('it renders a video post', () => {
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
