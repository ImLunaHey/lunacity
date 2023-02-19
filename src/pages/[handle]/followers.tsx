import { withPublicAccess } from '@app/common/with-public-access';
import type { NextPage } from 'next';
import { useTranslation } from 'react-i18next';

// Return the handle from the url
export const getServerSideProps = withPublicAccess((context) => {
  return {
    props: {
      handle: context.query.handle?.toString()?.replace('@', '').replace('/', ''),
    },
  };
});

const Followers: NextPage<{ handle: string }> = ({ handle }) => {
  const { t } = useTranslation();
  return <div>{t('follower-for', { handle })}</div>;
};

export default Followers;
