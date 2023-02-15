import { api } from '../utils/api';
import { TagCloud } from '../components/tag-cloud';
import { Loading } from '@nextui-org/react';
import { withPrivateAccess } from '@app/common/with-private-access';

export const getServerSideProps = withPrivateAccess();

const Tags = () => {
  const tags = api.tag.getAllTags.useQuery();

  // Show loading while we fetch data
  if (tags.isLoading) return <Loading />;

  return <TagCloud tags={tags.data ?? []} />;
};

export default Tags;
