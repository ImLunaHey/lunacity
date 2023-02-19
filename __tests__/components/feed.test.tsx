import Feed from '@app/components/feed';
import { render } from '@testing-library/react';

import '@testing-library/jest-dom';
import { createMockPost } from '__tests__/__utils__/mocks/create-mock-post';
import { createMockPage } from '__tests__/__utils__/mocks/create-mock-page';
import { createMockUser } from '__tests__/__utils__/mocks/create-mock-user';

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

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((text: string, args) => (args ? `${text} ${JSON.stringify(args, null)}` : text)),
    ready: true,
  })),
}));

// Mock text-post component
jest.mock('@app/components/text-post', () => ({
  __esModule: true,
  TextPost: () => <div>__TEXT_POST__MOCK__</div>,
}));

describe('Feed', () => {
  it('renders nothing when there are no items', () => {
    const { container } = render(<Feed items={[]} />);
    expect(container).toMatchSnapshot();
  });

  it('renders posts when there are items', () => {
    const { container } = render(
      <Feed
        items={[
          {
            ...createMockPost(),
            page: {
              ...createMockPage(),
              owner: createMockUser(),
            },
            media: [],
            tags: [],
          },
        ]}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders all of the posts', () => {
    const { container } = render(
      <Feed
        items={Array.from({ length: 20 }).map(() => ({
          ...createMockPost(),
          page: {
            ...createMockPage(),
            owner: createMockUser(),
          },
          media: [],
          tags: [],
        }))}
      />
    );

    expect(container.firstChild?.firstChild?.childNodes.length).toBe(21);
  });
});
