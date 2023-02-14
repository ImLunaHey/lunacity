import Link from 'next/link';

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { Notification } from '@app/stores/notification';

// Fix the padding and such
export const FollowedNotification: FC<{ notification: Notification | null }> = ({ notification }) => {
  const { t } = useTranslation();

  // If we forgot to pass data don't render
  if (!notification) return null;

  // TODO: Fix this
  if (!notification.data?.page?.handle) return null;

  return (
    <Link href={`/@${notification.data.page?.handle}`} className="text-xs text-gray-500 hover:text-white">
      {notification.data.page?.displayName ?? `@${notification.data.page?.handle}`} {t('followed-you')}
    </Link>
  );
};
