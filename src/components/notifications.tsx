import { Dropdown, Navbar, Badge, styled, Loading } from '@nextui-org/react';
import { FC } from 'react';
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
  const notifications = api.notification.getAllNotifications.useQuery();
  if (notifications.isLoading) return <Loading />;

  const handleSelection = () => undefined;

  return (
    <Dropdown placement="bottom-right">
      <Navbar.Item>
        <Dropdown.Trigger>
          <NotificationButton
            aria-label={`${(notifications.data ?? []).length} notifications`}
          >
            {/* @TODO: the content and above label should relfect the actual count, if above 99 show 99+ */}
            <Badge
              color="error"
              content={(notifications.data ?? []).length}
              shape="circle"
              size="sm"
            >
              <NotificationIcon fill="currentColor" width={30} height={25} />
            </Badge>
          </NotificationButton>
        </Dropdown.Trigger>
      </Navbar.Item>
      <Dropdown.Menu
        aria-label="User notifications"
        color="secondary"
        onSelectionChange={handleSelection}
      >
        {(notifications.data ?? [])?.map((notification) => (
          <Dropdown.Item
            key={notification.id}
            // @TODO: Add different icons for each notification type
            icon={<NotificationIcon className="mt-2" size={16} />}
            className="h-fit items-start py-2 leading-normal text-gray-500 hover:text-white"
          >
            {notification.type === 'followed' && (
              <FollowedNotification page={notification?.data?.page} />
            )}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
