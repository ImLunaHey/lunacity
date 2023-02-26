import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

const Bye: FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t('pages.bye.account-deactivated-title')}</h1>
      <p>{t('pages.bye.account-deactivated-message')}</p>
    </div>
  );
};

export default Bye;
