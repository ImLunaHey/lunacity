'use client';

import { LoadingSpinner } from '@app/components/loading-spinner';
import { useNotificationStore } from '@app/stores/notification';
import { Dropdown, Navbar, Badge, styled } from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { NotificationIcon } from '../icons/notification-icon';
import { api } from '../utils/api';
import { FollowedNotification } from './notifications/followed-notification';

const NotificationButton = styled('button', {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  '&:active': {
    opacity: 0.8,
  },
});

export const Notifications: FC = () => {
  const { t } = useTranslation(['common']);
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const notifications = useNotificationStore((state) => state.notifications);
  const addNotifications = useNotificationStore((state) => state.addNotifications);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const handleSelection = () => undefined;

  // Get all the current notifications from the server
  api.notification.getAllNotifications.useQuery(
    {},
    {
      onSuccess(notifications) {
        addNotifications(notifications);
        setIsLoading(false);
      },
    }
  );

  api.notification.getLiveNotifications.useSubscription(undefined, {
    onData({ notification }) {
      // @TODO: This should be a jsx per type
      if (!notification) return;

      // Save the notification to the store
      addNotification(notification);

      if (notification.type === 'FOLLOWED')
        toast(<FollowedNotification notification={notification} />, { delay: 1000 });
    },
    onStarted() {
      if (process.env.NODE_ENV === 'development') toast.info(t('notifications.live-notifications-started'));
    },
    onError(error) {
      toast.error(error.message);
    },
    enabled: session?.user?.id !== undefined,
  });

  // Don't render unless the user has a page
  if (!session?.user?.page?.handle) return null;

  if (isLoading) return <LoadingSpinner />;

  if (notifications.length === 0)
    return (
      <Dropdown placement="bottom-right">
        <Navbar.Item>
          <Dropdown.Trigger>
            <NotificationButton aria-label={`${notifications.length} notifications`}>
              {/* @TODO: the content and above label should reflect the actual count, if above 99 show 99+ */}
              <Badge color="error" content={notifications.length} shape="circle" size="sm">
                <NotificationIcon fill="currentColor" width={30} height={25} />
              </Badge>
            </NotificationButton>
          </Dropdown.Trigger>
        </Navbar.Item>
        <Dropdown.Menu aria-label="User notifications" color="secondary">
          <Dropdown.Item
            key="no-notifications"
            className="h-fit items-start py-2 leading-normal text-gray-500 hover:text-white"
          >
            No notifications
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );

  return (
    <Dropdown placement="bottom-right">
      <Navbar.Item>
        <Dropdown.Trigger>
          <NotificationButton aria-label={`${notifications.length} notifications`}>
            {/* @TODO: the content and above label should relfect the actual count, if above 99 show 99+ */}
            <Badge color="error" content={notifications.length} shape="circle" size="sm">
              <NotificationIcon fill="currentColor" width={30} height={25} />
            </Badge>
          </NotificationButton>
        </Dropdown.Trigger>
      </Navbar.Item>
      <Dropdown.Menu aria-label="User notifications" color="secondary" onSelectionChange={handleSelection}>
        {notifications.map((notification) => (
          <Dropdown.Item
            key={notification.id}
            // @TODO: Add different icons for each notification type
            icon={<NotificationIcon className="mt-2" size={16} />}
            className="h-fit items-start py-2 leading-normal text-gray-500 hover:text-white"
          >
            {notification.type === 'FOLLOWED' && <FollowedNotification notification={notification} />}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
