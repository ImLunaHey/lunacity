import { withPrivateAccess } from '@app/common/with-private-access';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const getServerSideProps = withPrivateAccess();

const Analytics: FC = () => {
  const { t } = useTranslation();
  return <div>{t('pages.analytics.title')}</div>;
};

export default Analytics;
