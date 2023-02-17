import { useSSR } from '@nextui-org/react';
import React, { type FC } from 'react';
import { Navbar, Text, Input, Dropdown, Avatar } from '@nextui-org/react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SearchIcon } from '../icons/search-icon';
import { Notifications } from './notifications';
import { useTranslation } from 'react-i18next';
import { type SubmitHandler, useForm } from 'react-hook-form';
import Logo from '@app/components/logo';

const DropdownMenu: FC = () => {
  const { data: session } = useSession();
  const { t } = useTranslation(['common']);
  if (!session?.user?.page?.handle) {
    return (
      <Dropdown.Menu aria-label="User menu actions" color="secondary">
        <Dropdown.Item textValue="Create page" key="profile" className="p-0">
          <Link className="m-0 block h-full w-full p-2 text-white" href="/page/create">
            <Text b color="inherit" css={{ d: 'flex' }}>
              Create page
            </Text>
          </Link>
        </Dropdown.Item>
        <Dropdown.Item command="⌘S" textValue="Settings" key="settings" withDivider>
          <Link className="m-0 block h-full w-full text-gray-400 hover:text-white" href="/settings">
            {t('page.settings.title')}
          </Link>
        </Dropdown.Item>
        <Dropdown.Item textValue="Help and feedback" key="help_and_feedback">
          <Link className="m-0 block h-full w-full text-gray-400 hover:text-white" href="/help">
            {t('page.help.title')}
          </Link>
        </Dropdown.Item>
        <Dropdown.Item textValue="Signout" key="signout" withDivider color="error">
          <a
            className="m-0 block h-full w-full text-gray-400 hover:text-white"
            onClick={() => void signOut({ callbackUrl: '/' })}
          >
            {t('signout')}
          </a>
        </Dropdown.Item>
      </Dropdown.Menu>
    );
  }

  return (
    <Dropdown.Menu aria-label="User menu actions" color="secondary">
      <Dropdown.Item textValue={`@${session.user?.page?.handle}`} key="profile" className="p-0">
        <Link className="m-0 block h-full w-full p-2 text-white" href={`/${session.user?.page?.handle}`}>
          <Text b color="inherit" css={{ d: 'flex' }}>
            @{session.user?.page?.handle}
          </Text>
        </Link>
      </Dropdown.Item>
      <Dropdown.Item command="⌘S" textValue="Settings" key="settings" withDivider>
        <Link className="m-0 block h-full w-full text-gray-400 hover:text-white" href="/settings">
          {t('page.settings.title')}
        </Link>
      </Dropdown.Item>
      <Dropdown.Item textValue="Analytics" key="analytics">
        <Link className="m-0 block h-full w-full text-gray-400 hover:text-white" href="/analytics">
          {t('page.analytics.title')}
        </Link>
      </Dropdown.Item>
      <Dropdown.Item textValue="Help and feedback" key="help_and_feedback">
        <Link className="m-0 block h-full w-full text-gray-400 hover:text-white" href="/help">
          {t('page.help.title')}
        </Link>
      </Dropdown.Item>
      <Dropdown.Item textValue="Signout" key="signout" withDivider color="error">
        <a
          className="m-0 block h-full w-full text-gray-400 hover:text-white"
          onClick={() => void signOut({ callbackUrl: '/' })}
        >
          {t('signout')}
        </a>
      </Dropdown.Item>
    </Dropdown.Menu>
  );
};

const UserMenu: FC = () => {
  return (
    <Dropdown placement="bottom-right">
      <Navbar.Item>
        <Dropdown.Trigger>
          <Avatar
            bordered
            as="button"
            color="primary"
            size="md"
            src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
          />
        </Dropdown.Trigger>
      </Navbar.Item>
      <DropdownMenu />
    </Dropdown>
  );
};

export default function NavBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useTranslation(['common']);
  const { isBrowser } = useSSR();

  // Search box
  type Inputs = { query: string };
  const { register, handleSubmit } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    void router.push({
      pathname: '/search',
      query: {
        query: data.query,
      },
    });
  };

  // Don't render the navbar when we're within SSR
  // See: https://github.com/nextui-org/nextui/issues/779
  if (!isBrowser) return null;

  // If there's no session at all don't render
  if (!session) return null;

  return (
    <Navbar isBordered variant="sticky">
      <Navbar.Brand css={{ mr: '$4' }}>
        <Logo />
        <Link href="/">
          <Text b color="inherit" css={{ mr: '$11' }} hideIn="xs">
            Lunacity
          </Text>
        </Link>
        <Navbar.Content hideIn="xs" variant="highlight">
          <Navbar.Link isActive={router.asPath === '/'} href="/" as={Link}>
            🏡 {t('page.home.title')}
          </Navbar.Link>
          <Navbar.Link isActive={router.asPath === '/explore'} href="/explore" as={Link}>
            🌏 {t('page.explore.title')}
          </Navbar.Link>
          <Navbar.Link isActive={router.asPath === '/messages'} href="/messages" as={Link}>
            📩 {t('page.messages.title')}
          </Navbar.Link>
        </Navbar.Content>
      </Navbar.Brand>

      {/* Search box */}
      <Navbar.Content
        className="w-full"
        css={{
          ':first-child': {
            width: '100%',
          },
        }}
      >
        <Navbar.Item className="mr-3 w-full">
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              aria-label="Search box"
              clearable
              contentLeft={<SearchIcon fill="var(--nextui-colors-accents6)" size={16} />}
              contentLeftStyling={false}
              className="w-full"
              css={{
                '& .nextui-input-content--left': {
                  height: '100%',
                  marginLeft: '$4',
                  dflex: 'center',
                },
              }}
              placeholder="Search..."
              {...register('query', { required: true, maxLength: 25 })}
            />
          </form>
        </Navbar.Item>
      </Navbar.Content>
      <Navbar.Content
        css={{
          '@xsMax': {
            jc: 'space-between',
          },
        }}
      >
        <Notifications />
        <UserMenu />
      </Navbar.Content>
    </Navbar>
  );
}
