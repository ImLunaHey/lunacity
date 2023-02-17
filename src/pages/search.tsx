import { withPrivateAccess } from '@app/common/with-private-access';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { api } from '@app/utils/api';
import Head from 'next/head';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const getServerSideProps = withPrivateAccess<{ query: string }>((context) => ({
  props: {
    query: context.query.query,
  },
}));

const Search: FC<{ query: string }> = ({ query }) => {
  const results = api.search.query.useQuery({ query });
  const { t } = useTranslation(['common']);

  if (results.isLoading) return <LoadingSpinner />;

  return (
    <>
      <Head>
        <title>{`Search results for: ${query}`}</title>
      </Head>
      <div>Search results for: {JSON.stringify(query)}</div>
      {results.data?.length === 0 && <div>{t('No results found.')}</div>}
      {results.data && results.data?.length >= 1 && <pre>{JSON.stringify(results.data, null, 2)}</pre>}
    </>
  );
};

export default Search;
