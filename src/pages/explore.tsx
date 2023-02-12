import { GetServerSidePropsContext, type NextPage } from 'next';
import Head from 'next/head';
import { getSession, useSession } from 'next-auth/react';
import { Loading } from '@nextui-org/react';
import Feed from '../components/feed';
import { api } from '../utils/api';
import { postService } from '@app/services/post-service';
import { prisma } from '@app/server/db';
import { serializeServerSideProps } from '@app/common/serialize-server-side-props';
import { GetServerSidePropsReturnType } from '@app/common/get-server-side-props-return-type';

export const getServerSideProps = async () => {
  const session = await getSession();
  const posts = await postService.getExporePosts({ prisma, session }, {});

  return {
    props: serializeServerSideProps({
      posts,
    }),
  };
};

const Explore: NextPage<GetServerSidePropsReturnType<typeof getServerSideProps>> = (props) => {
  const { status } = useSession();
  const posts = api.post.getExplorePosts.useQuery(undefined, {
    initialData: props.posts,
    refetchOnMount: false,
  });

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
