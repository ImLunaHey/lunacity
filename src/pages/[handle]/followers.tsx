import { withPublicAccess } from '@app/common/with-public-access';
import { type FC } from 'react';

// Return the handle from the url
export const getServerSideProps = withPublicAccess((context) => {
  return {
    props: {
      handle: context.query.handle?.toString()?.replace('@', '').replace('/', ''),
    },
  };
});

const Followers: FC = () => <div>Followers!</div>;

export default Followers;
