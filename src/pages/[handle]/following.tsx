import type { GetServerSidePropsContext, NextPage } from 'next';
import { api } from '@app/utils/api';
import { Badge, Loading } from '@nextui-org/react';
import Error from 'next/error';
import { humanTime } from '@app/common/human-time';

// Return the handle from the url
export function getServerSideProps(context: GetServerSidePropsContext<{ handle: string; postId: string }>) {
  return {
    props: {
      handle: context.query.handle?.toString()?.replace('@', '').replace('/', ''),
    },
  };
}

const Following: NextPage<{ handle: string }> = ({ handle }) => {
  const page = api.page.getPageFollowing.useQuery({ handle });
  if (page.isLoading) return <Loading />;
  if (!page.data) return <Error statusCode={404} title="No page exists with this handle"></Error>;
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
