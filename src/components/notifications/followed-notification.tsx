import { Page } from '.prisma/client';
import { Loading } from '@nextui-org/react';
import Link from 'next/link';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// Fix the padding and such
export const FollowedNotification: FC<{ page?: Page | null }> = ({ page }) => {
  const { t } = useTranslation();

  if (!page) return null;

  return (
    <Link
      href={`/@${page.handle}`}
      className="text-xs text-gray-500 hover:text-white"
    >
      {page.displayName ?? `@${page.handle}`} {t('followed-you')}
    </Link>
  );
};
