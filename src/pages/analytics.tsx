import { withAuth } from '@app/common/with-auth';
import { type FC } from 'react';

export const getServerSideProps = withAuth();

const Analytics: FC = () => {
  return <div>Analytics</div>;
};

export default Analytics;
