import { Loading } from '@nextui-org/react';
import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Feed from '../components/feed';
import { api } from '../utils/api';

const Explore: NextPage = () => {
  const { status } = useSession();
  const posts = api.post.getExplorePosts.useQuery();

  // Show loading while we fetch data
  if (posts.isLoading || status === 'loading') return <Loading />;

  return (
    <>
      <Head>
        <title>🌏 Explore</title>
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
