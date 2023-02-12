import { withAuth } from '@app/common/with-auth';
import { Loading } from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import type { FC } from 'react';

export const getServerSideProps = withAuth();

// @TODO: This should only work for devs
//        We need to make it so the user has a field that has this
const Settings: FC = () => {
  const { data, status } = useSession();

  if (status === 'loading') return <Loading />;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

export default Settings;
