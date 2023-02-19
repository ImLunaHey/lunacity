import { withPrivateAccess } from '@app/common/with-private-access';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { PageProfileCard } from '@app/components/page-profile-card';
import { api } from '@app/utils/api';
import type { Page, Post } from '@prisma/client';
import Head from 'next/head';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const getServerSideProps = withPrivateAccess<{ query: string }>((context) => ({
  props: {
    query: context.query.query,
  },
}));

const PageResult: FC<{ page: Page }> = ({ page }) => {
  return <PageProfileCard {...page} />;
};

const PostResult: FC<{ post: Post }> = ({ post }) => {
  return <pre>{JSON.stringify(post, null, 2)}</pre>;
};

const Search: FC<{ query: string }> = ({ query }) => {
  const results = api.search.query.useQuery({ query });
  const { t } = useTranslation();

  if (results.isLoading) return <LoadingSpinner />;

  // No results found
  if (results.data?.length === 0)
    return (
      <>
        <Head>
          <title>{t('search-results-for-query', { query })}</title>
        </Head>
        <div>{t('search-results-for-query', { query })}</div>
        <div>{t('no-results-found')}</div>
      </>
    );

  // Found results
  return (
    <>
      <Head>
        <title>{t('search-results-for-query', { query })}</title>
      </Head>
      <div>{t('search-results-for-query', { query })}</div>
      {results.data?.map((result) => {
        switch (result.type) {
          case 'page':
            return <PageResult page={result.data} />;
          case 'post':
            return <PostResult post={result.data} />;
          default:
            return null;
        }
      })}
    </>
  );
};

export default Search;
