import { humanTime } from '@app/common/human-time';
import { Badge } from '@nextui-org/react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const TimeAgo: FC<{ createdAt: Date; updatedAt?: Date }> = ({ createdAt, updatedAt }) => {
  const { t } = useTranslation();

  // If the updated time isn't the same as the created time then it's been updated
  const hasUpdated = createdAt.getTime() !== updatedAt?.getTime();
  const time = hasUpdated ? updatedAt : createdAt;

  // Don't render if we don't have at least one of the two "createdAt" or "updatedAt"
  if (!time) return null;

  return (
    <Badge isSquared>
      {hasUpdated ? t('Updated') : t('Posted')} {humanTime(time)}
    </Badge>
  );
};
