import type { GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import ErrorPage from 'next/error';
import { api } from '../utils/api';
import Feed from '../components/feed';
import { Badge, Button, Card, Grid, Loading, Spacer, Tooltip } from '@nextui-org/react';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Countdown from 'react-countdown-simple';
import { UserAvatar } from '../components/user-avatar';
import prettyMilliseconds from 'pretty-ms';
import { getSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import type { Infractions } from '@prisma/client';
import { FollowButton } from '../components/follow-button';
import PlanSelector from '@app/components/plan-selector';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const renderer = ({
  days,
  hours,
  minutes,
  seconds,
}: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}) => {
  if (days >= 1)
    return (
      <div>
        {days}d {hours}h {minutes}m {seconds}s
      </div>
    );
  if (hours >= 1)
    return (
      <div>
        {hours}h {minutes}m {seconds}s
      </div>
    );
  if (minutes >= 1)
    return (
      <div>
        {minutes}m {seconds}s
      </div>
    );
  return <div>{seconds}s</div>;
};

type ProfileHeaderProps = {
  id: string;
  description?: string;
  displayName: string;
  handle: string;
  official: boolean;
  infractions: Infractions[];
  following: boolean;
  followerCount: number;
  followingCount: number;
};

const ProfileHeader: FC<ProfileHeaderProps> = ({
  description,
  displayName,
  handle,
  official,
  infractions,
  following,
  followerCount,
  followingCount,
}) => {
  const { t } = useTranslation();
  const isBanned = infractions.filter((infraction) => infraction.severity === 'BAN').length >= 1;
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // Update session
  useEffect(() => {
    // TODO: this is a bit of a hack, make it less so?
    getSession()
      .then(setSession)
      .then(() => void setIsLoading(false))
      .catch(setError);
  }, []);

  // If we hit an error show it
  if (error) return <span>{error}</span>;

  // Wait until we've checked for a valid session
  if (isLoading) return <Loading />;

  return (
    <Card css={{ p: '$6' }}>
      <Card.Header>
        <UserAvatar
          src={'https://nextui.org/images/card-example-5.jpeg'}
          name={displayName || `@${handle}`}
          handle={handle}
          official={official}
        />
        <Grid.Container css={{ pl: '$6' }}>
          <Grid xs={12}>
            {/* Follow button */}
            {session && <FollowButton {...{ handle, following }} />}
            <Spacer x={0.2} />

            {/* Follow count */}
            <Link href={`/@${handle}/following`} className="inline-flex">
              <Badge isSquared size="sm">
                {t('Following')}: {followingCount}
              </Badge>
            </Link>
            <Spacer x={0.2} />

            {/* Follower count */}
            <Link href={`/@${handle}/followers`} className="inline-flex">
              <Badge isSquared size="sm">
                {t('Followers')}: {followerCount}
              </Badge>
            </Link>
            <Spacer x={0.2} />

            {/* Infractions */}
            {infractions.map(({ id, startTimestamp, endTimestamp, reason, severity }) => (
              <Tooltip
                content={
                  <div>
                    Reason: {reason}
                    <br />
                    Length:{' '}
                    {prettyMilliseconds(new Date(endTimestamp).getTime() - new Date(startTimestamp).getTime(), {
                      compact: true,
                    })}
                  </div>
                }
                placement="top"
                key={id}
              >
                <Badge size={'xs'} isSquared color={severity === 'BAN' ? 'error' : 'warning'} disableOutline>
                  {severity}: <Countdown targetDate={endTimestamp.toISOString()} renderer={renderer} />
                </Badge>
              </Tooltip>
            ))}
          </Grid>
        </Grid.Container>
      </Card.Header>
      <Card.Body css={{ py: '$2' }}>
        {!isBanned && description && <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>}
      </Card.Body>
    </Card>
  );
};

// Return the handle from the url
export function getServerSideProps(context: GetServerSidePropsContext<{ handle: string }>) {
  return {
    props: {
      handle: context.query.handle?.toString()?.replace('@', '').replace('/', ''),
    },
  };
}

const Page: NextPage<{ handle: string }> = ({ handle }) => {
  const [hidden, setHidden] = useState(true);
  const page = api.page.getPageDetails.useQuery({ handle });
  const posts = api.page.getPagePosts.useQuery({ handle });
  const items = posts.data ?? [];

  // Show loading while we fetch data
  if (page.isLoading || posts.isLoading)
    return (
      <main className="flex flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-4 pt-4">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loading />
          </div>
        </div>
      </main>
    );

  // Render 404 if the handle doesn't exist
  if (!page.data) return <ErrorPage statusCode={404} />;

  // Render the page
  return (
    <>
      <Head>
        <title>{handle}</title>
      </Head>
      <Grid>
        <ProfileHeader {...page.data} />
      </Grid>
      <Button size="xs" onPress={() => setHidden(!hidden)}>
        {hidden ? 'Show plans' : 'Hide'}
      </Button>
      <PlanSelector hidden={hidden} />
      <Spacer y={1} />
      <Grid>
        <Feed items={items} />
      </Grid>
    </>
  );
};

export default Page;
