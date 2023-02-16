import { withPublicAccess } from '@app/common/with-public-access';
import type { NextPage } from 'next';

// Return the handle from the url
export const getServerSideProps = withPublicAccess((context) => {
  return {
    props: {
      handle: context.query.handle?.toString()?.replace('@', '').replace('/', ''),
    },
  };
});

const Followers: NextPage<{ handle: string }> = ({ handle }) => <div>Followers for {handle}</div>;

export default Followers;
