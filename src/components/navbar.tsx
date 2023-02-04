import React from 'react';
import { Navbar, Text, Input, Dropdown, Avatar } from '@nextui-org/react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export const SearchIcon = ({ size, fill, width = 24, height = 24, ...props }: { size: number; fill?: string; width?: number; height?: number; }) => {
    return (
        <svg fill="none" height={size || height} viewBox="0 0 24 24" width={size || width} {...props}>
            <path
                d="M11.5 21a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19ZM22 22l-2-2"
                stroke={fill}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
            />
        </svg>
    );
};

export const NotificationIcon = ({
    fill = 'currentColor',
    size,
    height,
    width,
    ...props
}: {
    fill?: string;
    size?: number;
    width?: number;
    height?: number;
}) => {
    return (
        <svg
            width={size || width || 24}
            height={size || height || 24}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M19.3399 14.49L18.3399 12.83C18.1299 12.46 17.9399 11.76 17.9399 11.35V8.82C17.9399 6.47 16.5599 4.44 14.5699 3.49C14.0499 2.57 13.0899 2 11.9899 2C10.8999 2 9.91994 2.59 9.39994 3.52C7.44994 4.49 6.09994 6.5 6.09994 8.82V11.35C6.09994 11.76 5.90994 12.46 5.69994 12.82L4.68994 14.49C4.28994 15.16 4.19994 15.9 4.44994 16.58C4.68994 17.25 5.25994 17.77 5.99994 18.02C7.93994 18.68 9.97994 19 12.0199 19C14.0599 19 16.0999 18.68 18.0399 18.03C18.7399 17.8 19.2799 17.27 19.5399 16.58C19.7999 15.89 19.7299 15.13 19.3399 14.49Z"
                fill={fill}
            />
            <path
                d="M14.8297 20.01C14.4097 21.17 13.2997 22 11.9997 22C11.2097 22 10.4297 21.68 9.87969 21.11C9.55969 20.81 9.31969 20.41 9.17969 20C9.30969 20.02 9.43969 20.03 9.57969 20.05C9.80969 20.08 10.0497 20.11 10.2897 20.13C10.8597 20.18 11.4397 20.21 12.0197 20.21C12.5897 20.21 13.1597 20.18 13.7197 20.13C13.9297 20.11 14.1397 20.1 14.3397 20.07C14.4997 20.05 14.6597 20.03 14.8297 20.01Z"
                fill={fill}
            />
        </svg>
    );
};

export default function NavBar() {
    const { data: sessionData } = useSession();
    const router = useRouter();
    return sessionData && (
        <Navbar isBordered variant="sticky">
            <Navbar.Brand css={{ mr: '$4' }}>
                {/* TODO: Add a logo here */}
                {/* <AcmeLogo /> */}
                <Text b color="inherit" css={{ mr: '$11' }} hideIn="xs">
                    ACME
                </Text>
                <Navbar.Content hideIn="xs" variant="highlight">
                    <Navbar.Link isActive={router.asPath === '/'} href="/">Home</Navbar.Link>
                    <Navbar.Link isActive={router.asPath === '/feed'} href="/feed">Feed</Navbar.Link>
                    <Navbar.Link isActive={router.asPath === '/messages'} href="/messages">Messages</Navbar.Link>
                </Navbar.Content>
            </Navbar.Brand>
            <Navbar.Content>
                <Navbar.Item>
                    <Input
                        clearable
                        contentLeft={
                            <SearchIcon fill="var(--nextui-colors-accents6)" size={16} />
                        }
                        contentLeftStyling={false}
                        css={{
                            '@xs': {
                                minWidth: '300px',
                            },
                            '@sm': {
                                minWidth: '500px',
                            },
                            '@md': {
                                minWidth: '700px',
                            },
                            '@lg': {
                                minWidth: '800px',
                            },
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
                    <Dropdown.Menu
                        aria-label="User menu actions"
                        color="secondary"
                    >
                        <Dropdown.Item key="profile" css={{ height: '$18' }}>
                            <Text b color="inherit" css={{ d: 'flex' }}>
                                Signed in as
                            </Text>
                            <Text b color="inherit" css={{ d: 'flex' }}>
                                {sessionData.user?.email}
                            </Text>
                        </Dropdown.Item>
                        <Dropdown.Item key="settings" withDivider>
                            <Link href="/settings">Settings</Link>
                        </Dropdown.Item>
                        <Dropdown.Item key="analytics">
                            <Link href="/analytics">Analytics</Link>
                        </Dropdown.Item>
                        <Dropdown.Item key="help_and_feedback">
                            Help & Feedback
                        </Dropdown.Item>
                        <Dropdown.Item key="signout" withDivider color="error">
                            <a onClick={() => void signOut()}>Signout</a>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Navbar.Content>
        </Navbar>
    );
}