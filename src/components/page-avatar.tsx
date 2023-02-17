import { PageAvatarPopover } from '@app/components/page-avatar-popover';
import { Popover, User } from '@nextui-org/react';
import Link from 'next/link';
import type { FC } from 'react';

export const PageAvatar: FC<{
  src: string;
  name: string;
  description: string;
  handle: string;
  official: boolean;
  popover: boolean;
}> = ({ handle, name, src, official, popover, description }) => {
  // If we dont need a popover just return the avatar
  // This is mainly used in places where the avatar is used as a button for something else
  if (!popover)
    return (
      <User
        bordered
        as="button"
        color={official ? 'secondary' : 'primary'}
        altText={`Avatar for ${name}`}
        src={src}
        name={name}
        description={official ? '✅ Official' : ''}
      >
        <User.Link href={`/@${handle}`} target={'_self'} as={Link}>
          {`@${handle}`}
        </User.Link>
      </User>
    );
  // Return the avatar with a popover on click
  return (
    <Popover>
      <Popover.Trigger>
        <User
          bordered
          as="button"
          color={official ? 'secondary' : 'primary'}
          altText={`Avatar for ${name}`}
          src={src}
          name={name}
          description={official ? '✅ Official' : ''}
        >
          <User.Link href={`/@${handle}`} target={'_self'} as={Link}>
            {`@${handle}`}
          </User.Link>
        </User>
      </Popover.Trigger>
      <Popover.Content css={{ px: '$4', py: '$2' }}>
        <PageAvatarPopover {...{ handle, name, src, official, description }} />
      </Popover.Content>
    </Popover>
  );
};