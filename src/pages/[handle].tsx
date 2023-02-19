import type { NextPage } from 'next';
import Head from 'next/head';
import ErrorPage from 'next/error';
import { api } from '@app/utils/api';
import Feed from '@app/components/feed';
import { Button, Grid, Spacer } from '@nextui-org/react';
import { useState } from 'react';
import { PlanSelector } from '@app/components/plan-selector';
import { withPublicAccess } from '@app/common/with-public-access';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { PageProfileCard } from '@app/components/page-profile-card';

// Return the handle from the url
export const getServerSideProps = withPublicAccess((context) => {
  return {
    props: {
      handle: context.query.handle?.toString()?.replace('@', '').replace('/', ''),
    },
  };
});

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
        <PageProfileCard {...page.data} />
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
