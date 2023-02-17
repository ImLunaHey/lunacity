import { withPrivateAccess } from '@app/common/with-private-access';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { useSession } from 'next-auth/react';
import type { FC } from 'react';

export const getServerSideProps = withPrivateAccess();

// @TODO: This should only work for devs
//        We need to make it so the user has a field that has this
const Settings: FC = () => {
  const { data, status } = useSession();

  if (status === 'loading') return <LoadingSpinner />;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

export default Settings;
