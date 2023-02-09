import { User } from '@nextui-org/react';
import Link from 'next/link';
import type { FC } from 'react';

export const UserAvatar: FC<{
  src: string;
  name: string;
  handle: string;
  official: boolean;
}> = ({ handle, name, src, official }) => {
  return (
    <User
      bordered
      color={official ? 'secondary' : 'primary'}
      altText={`Avatar for ${name}`}
      src={src}
      name={name}
    >
      <User.Link href={`/@${handle}`} target={'_self'} as={Link}>
        @{handle}
      </User.Link>
    </User>
  );
};
