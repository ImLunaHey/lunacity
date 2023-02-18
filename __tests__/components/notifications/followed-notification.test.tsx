import { FollowedNotification } from '@app/components/notifications/followed-notification';
import { render } from '@testing-library/react';

import type { Notification } from '@app/stores/notification';

import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((text: string) => text),
    ready: true,
  })),
}));

describe('FollowedNotification', () => {
  it('renders nothing if no data is provided', () => {
    const { container } = render(<FollowedNotification notification={null} />);
    expect(container).toMatchSnapshot();
  });

  it('returns x followed you', () => {
    const notification = {
      data: {
        page: {
          handle: 'test-page',
        },
      },
      id: '123',
      read: false,
      type: 'FOLLOWED_BACK',
      notifiedId: '456',
    } as Notification;

    const { container } = render(<FollowedNotification notification={notification} />);
    expect(container).toMatchSnapshot();
  });
});
