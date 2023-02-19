import { Badge, Card, Grid, Spacer, Tooltip } from '@nextui-org/react';
import type { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Countdown from 'react-countdown-simple';
import { PageAvatar } from '@app/components/page-avatar';
import prettyMilliseconds from 'pretty-ms';
import { useSession } from 'next-auth/react';
import type { Infractions } from '@prisma/client';
import { FollowButton } from '@app/components/follow-button';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '@app/components/loading-spinner';

type ProfileHeaderProps = {
  id: string;
  description: string;
  displayName: string;
  handle: string;
  official: boolean;
  infractions?: Infractions[];
  following?: boolean;
  followerCount?: number;
  followingCount?: number;
};

// @TODO: add translations
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

// @TODO: Fix this stupid hack by using either a global store
// and then allowing this component to fetch data thats missing
export const PageProfileCard: FC<ProfileHeaderProps> = ({
  description,
  displayName,
  handle,
  official,
  infractions = [],
  following,
  followerCount = 0,
  followingCount = 0,
}) => {
  const { t } = useTranslation();
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
                {t('following-count', { followingCount })}
              </Badge>
            </Link>
            <Spacer x={0.2} />

            {/* Follower count */}
            <Link href={`/@${handle}/followers`} className="inline-flex">
              <Badge isSquared size="sm">
                {t('follower-count', { followerCount })}
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
