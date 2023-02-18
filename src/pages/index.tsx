import { type NextPage } from 'next';
import Head from 'next/head';
import { signIn, useSession } from 'next-auth/react';
import { Button, Spacer, Text } from '@nextui-org/react';
import Link from 'next/link';
import { api } from '../utils/api';
import { useSSR } from '@nextui-org/react';
import Feed from '../components/feed';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { withPublicAccess } from '@app/common/with-public-access';
import { LoadingSpinner } from '@app/components/loading-spinner';

export const getServerSideProps = withPublicAccess();

export const UnauthenticatedPage: FC = () => {
  const { t } = useTranslation(['common']);
  const { isBrowser } = useSSR();
  const { data: realTimeUserCount, isLoading } = api.stats.getRealtimeUserCount.useQuery();

  // Don't render the navbar when we're within SSR
  // See: https://github.com/nextui-org/nextui/issues/779
  if (!isBrowser) return null;

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <Text h1>{t('pages.home.welcome.title')}</Text>
        <Text h3>{t('pages.home.welcome.message')}</Text>
        <Text>There are currently {isLoading ? <LoadingSpinner /> : realTimeUserCount} people online.</Text>
        <Button onClick={() => void signIn()}>{t('signin')}</Button>
      </div>
    </div>
  );
};

export const AuthenticatedPage: FC = () => {
  const { t } = useTranslation(['common']);
  const { data: session } = useSession();
  const posts = api.user.getAllPosts.useQuery(undefined, { enabled: session?.user.page?.id !== undefined });

  // Show loading while we fetch data
  if (posts.isLoading) return <LoadingSpinner />;

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <div className="flex flex-col">
        <div className="flex flex-row-reverse">
          <Link className="rounded-md bg-white p-2 text-black" href="/post/create">
            {t('pages.home.create-post')}
          </Link>
        </div>
        <Spacer y={0.5} />
        <Feed className="clear-both mt-2" items={posts.data ?? []} />
      </div>
    </>
  );
};

const Home: NextPage = () => {
  const { status } = useSession();

  // Show loading while we fetch data
  if (status === 'loading') return <LoadingSpinner />;

  // Unauthenticated user
  if (status === 'unauthenticated') return <UnauthenticatedPage />;

  // Authenticated user
  return <AuthenticatedPage />;
};

export default Home;
