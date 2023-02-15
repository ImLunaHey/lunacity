import { withPrivateAccess } from '@app/common/with-private-access';
import { type FC } from 'react';

export const getServerSideProps = withPrivateAccess();

const Analytics: FC = () => {
  return <div>Analytics</div>;
};

export default Analytics;
