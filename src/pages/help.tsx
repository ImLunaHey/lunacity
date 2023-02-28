import { Link, Text } from '@nextui-org/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Help = () => {
  const { t } = useTranslation();
  return (
    <>
      <Text h1>{t('help')}</Text>
      <Text><Link href="/privacy-policy">{t('privacy-policy')}</Link></Text>
      <Text><Link href="/terms-of-service">{t('terms-of-service')}</Link></Text>
    </>
  );
};

export default Help;
