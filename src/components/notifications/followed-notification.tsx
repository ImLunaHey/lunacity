import Link from 'next/link';

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { Notification } from '@app/stores/notification';

// Fix the padding and such
export const FollowedNotification: FC<{ notification: Notification | null }> = ({ notification }) => {
  const { t } = useTranslation();

  // If we don't have a page, don't render
  if (!notification?.data?.page) return null;

  return (
    <Link href={`/@${notification.data.page.handle}`} className="text-xs text-gray-500 hover:text-white">
      {t('followed-you', { page: notification.data.page })}
    </Link>
  );
};
