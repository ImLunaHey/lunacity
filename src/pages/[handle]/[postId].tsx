import type { NextPage } from 'next';
import { SinglePost } from '@app/components/single-post';
import { api } from '@app/utils/api';
import Error from 'next/error';
import { withPublicAccess } from '@app/common/with-public-access';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { useTranslation } from 'react-i18next';

// Return the postId from the url
export const getServerSideProps = withPublicAccess((context) => {
  return {
    props: {
      postId: context.query.postId,
    },
  };
});

const Post: NextPage<{ postId: string }> = ({ postId }) => {
  const { t } = useTranslation();
  const post = api.post.getPostDetails.useQuery({ postId });
  if (post.isLoading) return <LoadingSpinner />;
  if (!post.data) return <Error statusCode={404} title={t('errors.post.not-found')}></Error>;
  return <SinglePost post={post.data} />;
};

export default Post;
