import Link from 'next/link';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { Notification } from '@app/stores/notification';

// Fix the padding and such
export const FollowedNotification: FC<{ notification: Notification }> = ({ notification: { data } }) => {
  const { t } = useTranslation();

  // TODO: Fix this 
  if (!data?.page?.handle) return null;

  return (
    <Link href={`/@${data.page?.handle}`} className="text-xs text-gray-500 hover:text-white">
      {data.page?.displayName ?? `@${data.page?.handle}`} {t('followed-you')}
    </Link>
  );
};
