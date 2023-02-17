import type { NextPage } from 'next';
import Head from 'next/head';
import ErrorPage from 'next/error';
import { api } from '../utils/api';
import Feed from '../components/feed';
import { Badge, Button, Card, Grid, Spacer, Tooltip } from '@nextui-org/react';
import type { FC } from 'react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Countdown from 'react-countdown-simple';
import { PageAvatar } from '../components/page-avatar';
import prettyMilliseconds from 'pretty-ms';
import { useSession } from 'next-auth/react';
import type { Infractions } from '@prisma/client';
import { FollowButton } from '../components/follow-button';
import { PlanSelector } from '@app/components/plan-selector';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { withPublicAccess } from '@app/common/with-public-access';
import { LoadingSpinner } from '@app/components/loading-spinner';

// Return the handle from the url
export const getServerSideProps = withPublicAccess((context) => {
  return {
    props: {
      handle: context.query.handle?.toString()?.replace('@', '').replace('/', ''),
    },
  };
});

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
  description: string;
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
  const { t } = useTranslation(['common']);
  const isBanned = infractions.filter((infraction) => infraction.severity === 'BAN').length >= 1;
  const { data: session, status } = useSession();

  // Wait until we've checked for a valid session
  if (status === 'loading') return <LoadingSpinner />;

  return (
    <Card css={{ p: '$6' }}>
      <Card.Header>
        <PageAvatar
          src={'https://nextui.org/images/card-example-5.jpeg'}
          name={displayName}
          handle={handle}
          official={official}
          description={description}
          popover={true}
          followerCount={followerCount}
          followingCount={followingCount}
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
            <LoadingSpinner />
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
