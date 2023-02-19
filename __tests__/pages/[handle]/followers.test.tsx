import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import Followers, { getServerSideProps } from '@app/pages/[handle]/followers';
import type { IncomingMessage, ServerResponse } from 'http';

jest.mock('@app/common/with-public-access', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
  withPublicAccess: (fn: any) => (ctx: any) => fn(ctx),
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

  it('renders the followers page', () => {
    const { container } = render(<Followers handle="staff" />);
    expect(container).toMatchSnapshot();
  });
});
