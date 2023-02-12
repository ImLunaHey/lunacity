import Link from 'next/link';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Notification } from '@app/stores/notification';

// Fix the padding and such
export const FollowedNotification: FC<{ notification: Notification }> = ({ notification: { data } }) => {
  const { t } = useTranslation();

  if (!data) return null;

  return (
    <Link href={`/@${data.page?.handle}`} className="text-xs text-gray-500 hover:text-white">
      {data.page?.displayName ?? `@${data.page?.handle}`} {t('followed-you')}
    </Link>
  );
};
