import { useSSR } from '@nextui-org/react';
import React, { type FC } from 'react';
import { Navbar, Text, Input, Dropdown, Avatar } from '@nextui-org/react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SearchIcon } from '@app/components/icons/search-icon';
import { Notifications } from './notifications';
import { useTranslation } from 'react-i18next';
import { type SubmitHandler, useForm } from 'react-hook-form';
import Logo from '@app/components/logo';

const DropdownMenu: FC = () => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  if (!session?.user?.page?.handle) {
    return (
      <Dropdown.Menu aria-label="User menu actions" color="secondary">
        <Dropdown.Item textValue={t('create-page')} key="profile" className="p-0">
          <Link className="m-0 block h-full w-full p-2 text-white" href="/page/create">
            <Text b color="inherit" css={{ d: 'flex' }}>
              {t('create-page')}
            </Text>
          </Link>
        </Dropdown.Item>
        <Dropdown.Item textValue={t('pages.settings.title')} key="settings" withDivider>
          <Link className="m-0 block h-full w-full text-gray-400 hover:text-white" href="/settings">
            {t('pages.settings.title')}
          </Link>
        </Dropdown.Item>
        <Dropdown.Item textValue={t('pages.help.title')} key="help_and_feedback">
          <Link className="m-0 block h-full w-full text-gray-400 hover:text-white" href="/help">
            {t('pages.help.title')}
          </Link>
        </Dropdown.Item>
        <Dropdown.Item textValue={t('signout')} key="signout" withDivider color="error">
          <a
            className="m-0 block h-full w-full text-gray-400 hover:text-white"
            onClick={() => void signOut({ callbackUrl: '/' })}
          >
            {t('sign-out')}
          </a>
        </Dropdown.Item>
      </Dropdown.Menu>
    );
  }

  return (
    <Dropdown.Menu aria-label={t('navbar.user-menu-label')} color="secondary">
      <Dropdown.Item textValue={`@${session.user?.page?.handle}`} key="profile" className="p-0">
        <Link className="m-0 block h-full w-full p-2 text-white" href={`/${session.user?.page?.handle}`}>
          <Text b color="inherit" css={{ d: 'flex' }}>
            @{session.user?.page?.handle}
          </Text>
        </Link>
      </Dropdown.Item>
      <Dropdown.Item textValue={t('pages.settings.title')} key="settings" withDivider>
        <Link className="m-0 block h-full w-full text-gray-400 hover:text-white" href="/settings">
          {t('pages.settings.title')}
        </Link>
      </Dropdown.Item>
      <Dropdown.Item textValue={t('pages.analytics.title')} key="analytics">
        <Link className="m-0 block h-full w-full text-gray-400 hover:text-white" href="/analytics">
          {t('pages.analytics.title')}
        </Link>
      </Dropdown.Item>
      <Dropdown.Item textValue={t('pages.help.title')} key="help_and_feedback">
        <Link className="m-0 block h-full w-full text-gray-400 hover:text-white" href="/help">
          {t('pages.help.title')}
        </Link>
      </Dropdown.Item>
      {/* Show admin link for admins */}
      {session?.user?.role === 'ADMIN' ? (
        <Dropdown.Item textValue={t('pages.admin.title')} withDivider key="admin">
          <Link className="m-0 block h-full w-full text-gray-400 hover:text-white" href="/admin">
            {t('pages.admin.title')}
          </Link>
        </Dropdown.Item>
      ) : <></>}
      <Dropdown.Item textValue={t('sign-out')} key="signout" withDivider color="error">
        <a
          className="m-0 block h-full w-full text-gray-400 hover:text-white"
          onClick={() => void signOut({ callbackUrl: '/' })}
        >
          {t('sign-out')}
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
  const { t, ready } = useTranslation();
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

  // If the translations aren't ready yet don't render
  if (!ready) return null;

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
            {t('components.navbar.links.home')}
          </Navbar.Link>
          <Navbar.Link isActive={router.asPath === '/explore'} href="/explore" as={Link}>
            {t('components.navbar.links.explore')}
          </Navbar.Link>
          <Navbar.Link isActive={router.asPath === '/messages'} href="/messages" as={Link}>
            {t('components.navbar.links.messages')}
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
              aria-label={t('search-box-label')}
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
              placeholder={t('placeholder.search')}
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
