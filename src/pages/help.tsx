import React from 'react';
import { useTranslation } from 'react-i18next';

const Help = () => {
  const { t } = useTranslation();
  return <div>{t('help')}</div>;
};

export default Help;
