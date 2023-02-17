import type { FC } from 'react';
import { Loading } from '@nextui-org/react';

export const LoadingSpinner: FC = () => {
  return <Loading as="span" type="points-opacity" color="currentColor" size="sm" />;
};
