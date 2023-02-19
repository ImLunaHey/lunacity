import type { NextPage } from 'next';
import { api } from '@app/utils/api';
import { Badge } from '@nextui-org/react';
import Error from 'next/error';
import { humanTime } from '@app/common/human-time';
import { withPublicAccess } from '@app/common/with-public-access';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { useTranslation } from 'react-i18next';

// Return the handle from the url
export const getServerSideProps = withPublicAccess((context) => {
  return {
    props: {
      handle: context.query.handle?.toString()?.replace('@', '').replace('/', ''),
    },
  };
});

const Following: NextPage<{ handle: string }> = ({ handle }) => {
  const { t } = useTranslation();
  const page = api.page.getPageFollowing.useQuery({ handle });
  if (page.isLoading) return <LoadingSpinner />;
  if (!page.data) return <Error statusCode={404} title={t('errors.page.not-found')}></Error>;
  return (
    <>
      {page.data.map((follows) => (
        <div key={follows.followerId}>
          {follows.follower.handle} <Badge>{humanTime(follows.createdAt)}</Badge>
        </div>
      ))}
    </>
  );
};

export default Following;
