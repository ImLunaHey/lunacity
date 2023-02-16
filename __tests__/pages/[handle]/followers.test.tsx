import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import Followers, { getServerSideProps } from '../../../src/pages/[handle]/followers';
import type { IncomingMessage, ServerResponse } from 'http';

jest.mock('@app/common/with-public-access', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
  withPublicAccess: (fn: any) => (ctx: any) => fn(ctx),
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
