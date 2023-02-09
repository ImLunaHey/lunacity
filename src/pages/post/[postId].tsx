import type { GetServerSidePropsContext, NextPage } from 'next';
import { SinglePost } from '@app/components/single-post';
import { api } from '@app/utils/api';
import { Loading } from '@nextui-org/react';
import Error from 'next/error';

// Return the handle from the url
export function getServerSideProps(context: GetServerSidePropsContext<{ postId: string }>) {
  return {
    props: {
      postId: context.query.postId,
    },
  };
}

const Post: NextPage<{ postId: string }> = ({ postId }) => {
  const post = api.post.getPostDetails.useQuery({ postId });
  if (post.isLoading) return <Loading />;
  if (!post.data) return <Error statusCode={404} title="No post exists with this ID"></Error>;
  return <SinglePost {...post.data} />;
};

export default Post;
