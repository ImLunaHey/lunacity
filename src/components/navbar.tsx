import React from 'react';
import { Navbar, Text, Input, Dropdown, Avatar, red } from '@nextui-org/react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SearchIcon } from '../icons/search-icon';
import { Notifications } from './notifications';
import { useTranslation } from 'react-i18next';

export default function NavBar() {
  const { data: sessionData } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  return (
    sessionData && (
      <Navbar isBordered variant="sticky">
        <Navbar.Brand css={{ mr: '$4' }}>
          {/* TODO: Add a logo here */}
          {/* <AcmeLogo /> */}
          <Link href="/">
            <Text b color="inherit" css={{ mr: '$11' }} hideIn="xs">
              ACME
            </Text>
          </Link>
          <Navbar.Content hideIn="xs" variant="highlight">
            <Navbar.Link isActive={router.asPath === '/'} href="/" as={Link}>
              🏡 {t('page.home.title')}
            </Navbar.Link>
            <Navbar.Link
              isActive={router.asPath === '/explore'}
              href="/explore"
              as={Link}
            >
              🌏 {t('page.explore.title')}
            </Navbar.Link>
            <Navbar.Link
              isActive={router.asPath === '/messages'}
              href="/messages"
              as={Link}
            >
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
          <Navbar.Item className="w-full">
            <Input
              aria-label="Search box"
              clearable
              contentLeft={
                <SearchIcon fill="var(--nextui-colors-accents6)" size={16} />
              }
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
            />
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

          {/* User menu */}
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
            <Dropdown.Menu aria-label="User menu actions" color="secondary">
              <Dropdown.Item
                textValue={`@${sessionData.user?.page?.handle}`}
                key="profile"
                className="p-0"
              >
                <Link
                  className="m-0 block h-full w-full p-2 text-white"
                  href={`/${sessionData.user?.page?.handle}`}
                >
                  <Text b color="inherit" css={{ d: 'flex' }}>
                    @{sessionData.user?.page?.handle}
                  </Text>
                </Link>
              </Dropdown.Item>
              <Dropdown.Item
                command="⌘S"
                textValue="Settings"
                key="settings"
                withDivider
              >
                <Link
                  className="m-0 block h-full w-full text-gray-400 hover:text-white"
                  href="/settings"
                >
                  {t('page.settings.title')}
                </Link>
              </Dropdown.Item>
              <Dropdown.Item textValue="Analytics" key="analytics">
                <Link
                  className="m-0 block h-full w-full text-gray-400 hover:text-white"
                  href="/analytics"
                >
                  {t('page.analytics.title')}
                </Link>
              </Dropdown.Item>
              <Dropdown.Item
                textValue="Help and feedback"
                key="help_and_feedback"
              >
                <Link
                  className="m-0 block h-full w-full text-gray-400 hover:text-white"
                  href="/help"
                >
                  {t('page.help.title')}
                </Link>
              </Dropdown.Item>
              <Dropdown.Item
                textValue="Signout"
                key="signout"
                withDivider
                color="error"
              >
                <a
                  className="m-0 block h-full w-full text-gray-400 hover:text-white"
                  onClick={() => void signOut({ callbackUrl: '/' })}
                >
                  {t('signout')}
                </a>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Navbar.Content>
      </Navbar>
    )
  );
}
