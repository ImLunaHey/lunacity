import Error from 'next/error';
import type { GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import { api } from '../utils/api';
import Feed from '../components/feed';
import { Badge, Button, Card, Grid, Loading, Spacer, Tooltip } from '@nextui-org/react';
import type { FC} from 'react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Countdown from 'react-countdown-simple';
import { UserAvatar } from '../components/user-avatar';
import prettyMilliseconds from 'pretty-ms';
import { getSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import type { Infraction } from '@prisma/client';

// Return the handle from the url
export function getServerSideProps(context: GetServerSidePropsContext<{ handle: string; }>) {
    return {
        props: {
            handle: (context.query.handle)?.toString()?.replace('@', '').replace('/', ''),
        }
    };
}

const renderer = ({ days, hours, minutes, seconds }: { days: number; hours: number; minutes: number; seconds: number; }) => {
    if (days >= 1) return (<div>{days}d {hours}h {minutes}m {seconds}s</div>);
    if (hours >= 1) return (<div>{hours}h {minutes}m {seconds}s</div>);
    if (minutes >= 1) return (<div>{minutes}m {seconds}s</div>);
    return (<div>{seconds}s</div>);
};

type ProfileHeaderProps = {
    id: string;
    description?: string;
    name: string;
    handle: string;
    official: boolean;
    infractions: Infraction[];
    followedBy: { followerId: string; }[];
};

const FollowButton: FC<{ handle: string; following: boolean }> = ({ handle, following }) => {
    const mutation = api.page.followPage.useMutation();
    const [isFollowing, setIsFollowing] = useState(following);
    const [error, setError] = useState<string | null>(null);

    // If we hit an error show it
    if (error) return (<span>{error}</span>);

    // Show the follow button
    return (
        <Button
            className='min-w-0'
            size='xs'
            color='secondary'
            aria-label='Follow'
            onClick={() => {
                // Post to server
                mutation.mutate({ handle }, {
                    onError(error) {
                        setError(error.message);
                    },
                    onSuccess() {
                        setIsFollowing(!isFollowing);
                    },
                });
            }}
        >{isFollowing ? 'Unfollow' : 'Follow'}</Button>
    );
};

const ProfileHeader: FC<ProfileHeaderProps> = ({ id, description, name, handle, official, infractions, followedBy }) => {
    const isBanned = infractions.filter(infraction => infraction.severity === 'ban').length >= 1;
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [session, setSession] = useState<Session | null>(null);

    // Update session
    useEffect(() => {
        // TODO: this is a bit of a hack, make it less so?
        getSession().then(setSession).then(() => void setIsLoading(false)).catch(setError);
    }, []);

    // If we hit an error show it
    if (error) return (<span>{error}</span>);

    // Wait until we've checked for a valid session
    if (isLoading) return (<Loading />);

    return (
        <Card css={{ p: '$6' }}>
            <Card.Header>
                <UserAvatar src={'https://nextui.org/images/card-example-5.jpeg'} name={name || `@${handle}`} handle={handle} official={official} />
                <Grid.Container css={{ pl: '$6' }}>
                    <Grid xs={12}>
                        {session && session.page?.id !== id && <FollowButton handle={handle} following={followedBy.map(_ => _.followerId).includes(session.page?.id ?? '')}  />}
                        <Spacer x={1} />
                        {infractions.map(({ id, startTimestamp, endTimestamp, reason, severity }) => (
                            <Tooltip
                                content={
                                    <div>Reason: {reason}<br/>Length: {prettyMilliseconds(new Date(endTimestamp).getTime() - new Date(startTimestamp).getTime(), { compact: true })}</div>
                                }
                                placement="top"
                                key={id}
                            >
                                <Badge size={'xs'} isSquared color={severity === 'ban' ? 'error' : 'warning'} disableOutline>{severity}: <Countdown targetDate={endTimestamp.toISOString()} renderer={renderer}/></Badge>
                            </Tooltip>
                        ))}
                    </Grid>
                </Grid.Container>
            </Card.Header>
            <Card.Body css={{ py: '$2' }}>
                {!isBanned && description && (<ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>)}
            </Card.Body>
        </Card>
    );
};

const Page: NextPage<{ handle: string; }> = ({ handle }) => {
    const page = api.page.getPageDetails.useQuery({ handle });
    const posts = api.page.getPagePosts.useQuery({ handle });

    // Show loading while we fetch data
    if (page.isLoading || posts.isLoading) return (
        <main className="flex flex-col items-center justify-center">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-4 pt-4">
                <div className="flex flex-col items-center justify-center gap-4">
                    <Loading />
                </div>
            </div>
        </main>
    );

    // Render 404 if the handle doesn't exist
    if (!page.data) return <Error statusCode={404} />;

    // Render the page
    return (
        <>
            <Head>
                <title>{handle}</title>
            </Head>
            <main className="flex min-h-screen flex-col py-2 px-10 space-y-4 ">
                <Grid><ProfileHeader {...page.data} /></Grid>
                <Grid><Feed items={posts.data?.map(post => ({
                    id: post.id,
                    page: post.page,
                    tags: post.tags,
                    body: post.body,
                    type: post.type as 'text',
                })) ?? []} /></Grid>
            </main>
        </>
    );
};

export default Page;
