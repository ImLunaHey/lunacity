import { api } from '../utils/api';
import { TagCloud } from '../components/tag-cloud';
import { Loading } from '@nextui-org/react';
import { withAuth } from '@app/common/with-auth';

export const getServerSideProps = withAuth();

const Tags = () => {
  const tags = api.tag.getAllTags.useQuery();

  // Show loading while we fetch data
  if (tags.isLoading) return <Loading />;

  return <TagCloud tags={tags.data ?? []} />;
};

export default Tags;
