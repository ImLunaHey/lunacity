import { ImagePost } from '@app/components/image-post';
import { TextPost } from '@app/components/text-post';
import { type RouterOutputs } from '@app/utils/api';

export type SinglePostProps = RouterOutputs['post']['getPostDetails'];

export const SinglePost: React.FC<{ post: SinglePostProps }> = ({ post }) => {
  if (!post) return null;
  if (post.type === 'gallery') return null;
  if (post.type === 'image') return <ImagePost post={post} />;
  if (post.type === 'text') return <TextPost post={post} />;
  if (post.type === 'video') return null;
  return null;
};
