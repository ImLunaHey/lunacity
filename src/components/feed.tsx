import React from 'react';
import { SinglePost } from './single-post';
import type { SinglePostProps } from './single-post';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '@app/components/loading-spinner';

type FeedProps = {
  items?: SinglePostProps[];
  publicCursor?: string;
  personalCursor?: string;
  className?: string;
  fetchData?: (opts?: { personalCursor?: string; publicCursor?: string }) => () => void;
};

const getUniqueItemsInArray = (items: SinglePostProps[]): Exclude<SinglePostProps, null>[] => {
  const seen: Record<string, boolean> = {};
  return items.filter((item) => (seen.hasOwnProperty(item.id) ? false : (seen[item.id] = true)));
};

const Feed: React.FC<FeedProps> = ({ items, fetchData = () => () => undefined, personalCursor, publicCursor }) => {
  const { t } = useTranslation(['common']);
  if (!items) return null;
  const uniqueItems = getUniqueItemsInArray(items);

  return (
    <InfiniteScroll
      next={fetchData({ publicCursor, personalCursor })}
      dataLength={uniqueItems.length}
      hasMore={uniqueItems.length === 50}
      loader={<LoadingSpinner />}
      endMessage={
        <p style={{ textAlign: 'center' }}>
          <b>{t('no-more-posts')}</b>
        </p>
      }
      // // below props only if you need pull down functionality
      // refreshFunction={fetchData()}
      // pullDownToRefresh
      // pullDownToRefreshThreshold={50}
      // pullDownToRefreshContent={
      //   <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
      // }
      // releaseToRefreshContent={
      //   <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
      // }
    >
      {uniqueItems.map((post) => (
        <SinglePost post={post} key={post.id} />
      ))}
    </InfiniteScroll>
  );
};

export default Feed;
