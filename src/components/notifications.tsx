import { useNotificationStore } from '@app/stores/notification';
import { Dropdown, Navbar, Badge, styled, Loading } from '@nextui-org/react';
import { FC, useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const notifications = useNotificationStore((state) => state.notifications);
  const addNotifications = useNotificationStore((state) => state.addNotifications);
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

  if (isLoading) return <Loading />;

  if (notifications.length === 0)
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
