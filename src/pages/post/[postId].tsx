import type { NextPage } from 'next';
import { SinglePost } from '../../components/single-post';
import { api } from '../../utils/api';

const Post: NextPage<{ postId: string; }> = ({ postId }) => {
    const post = api.post.getPostDetails.useQuery({ postId });
    return (<SinglePost {...post.data as any} />);
};

export default Post;
