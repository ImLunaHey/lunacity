import { withPublicAccess } from '@app/common/with-public-access';
import { LoadingSpinner } from '@app/components/loading-spinner';
import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import Feed from '@app/components/feed';
import { api } from '@app/utils/api';

export const getServerSideProps = withPublicAccess();

const Explore: NextPage = () => {
  const { status } = useSession();
  const { t } = useTranslation();
  const posts = api.post.getExplorePosts.useQuery();

  // Show loading while we fetch data
  if (posts.isLoading || status === 'loading') return <LoadingSpinner />;

  return (
    <>
      <Head>
        <title>{t('pages.explore.title')}</title>
      </Head>
      <Feed
        items={posts.data?.posts ?? []}
        publicCursor={posts.data?.publicCursor}
        personalCursor={posts.data?.personalCursor}
      />
    </>
  );
};

export default Explore;
