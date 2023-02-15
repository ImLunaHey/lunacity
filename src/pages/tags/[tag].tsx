import { withPublicAccess } from '@app/common/with-public-access';
import type { NextPage } from 'next';

export const getServerSideProps = withPublicAccess();

const Page: NextPage<{ tag: string }> = ({ tag }) => {
  return <div>{tag}</div>;
};

export default Page;
