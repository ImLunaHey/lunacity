import { api } from '../utils/api';
import { TagCloud } from '../components/tag-cloud';
import { withPrivateAccess } from '@app/common/with-private-access';
import { LoadingSpinner } from '@app/components/loading-spinner';

export const getServerSideProps = withPrivateAccess();

const Tags = () => {
  const tags = api.tag.getAllTags.useQuery();

  // Show loading while we fetch data
  if (tags.isLoading) return <LoadingSpinner />;

  return <TagCloud tags={tags.data ?? []} />;
};

export default Tags;
