import { withAuth } from '@app/common/with-auth';
import { api } from '@app/utils/api';
import { Loading } from '@nextui-org/react';
import Head from 'next/head';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const getServerSideProps = withAuth<{ query: string }>((context) => ({
  props: {
    query: context.query.query,
  },
}));

const Search: FC<{ query: string }> = ({ query }) => {
  const results = api.search.query.useQuery({ query });
  const { t } = useTranslation();

  if (results.isLoading) return <Loading />;

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
