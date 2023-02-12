'use client';

import { Button, Loading } from '@nextui-org/react';
import { type FC, useState } from 'react';
import { api } from '../utils/api';
import ErrorComponent from '../components/error';
import { useSession } from 'next-auth/react';
import { type TRPCClientErrorLike } from '@trpc/client';
import { useTranslation } from 'react-i18next';

type handleErrorProps = {
  error: TRPCClientErrorLike<any>;
  setError: (error: { statusCode: number; message: string } | null) => void;
};

const handleError = ({ error, setError }: handleErrorProps) => {
  setError({ statusCode: 500, message: error.message });
  setTimeout(() => {
    setError(null);
  }, 10_000);
};

export const FollowButton: FC<{ handle: string }> = ({ handle }) => {
  const { t } = useTranslation();
  const session = useSession();
  const followingState = api.page.followingState.useQuery({ handle }, { enabled: session.status === 'authenticated' });
  const followPage = api.page.followPage.useMutation();
  const unfollowPage = api.page.unfollowPage.useMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{
    statusCode: number;
    message: string;
  } | null>(null);

  const onError = (error: TRPCClientErrorLike<any>) => {
    handleError({ error, setError });
    setIsLoading(false);
  };
  const onSuccess = () => {
    // @TODO: handle if this fails fetching
    void followingState.refetch().then(() => {
      setIsLoading(false);
    });
  };

  // @TODO: This needs a debounce
  const onPress = () => {
    setIsLoading(true);

    // Unfollow page
    if (followingState.data) {
      unfollowPage.mutate(
        { handle },
        {
          onError,
          onSuccess,
        }
      );
    } else {
      // Follow page
      followPage.mutate(
        { handle },
        {
          onError,
          onSuccess,
        }
      );
    }
  };

  const generateText = (isFollowing?: boolean) => {
    if (isFollowing === undefined) return;
    return isFollowing ? t('unfollow') : t('follow');
  };

  // If we hit an error show it
  if (error) return <ErrorComponent {...error} />;

  if (session.status === 'loading') return <Loading />;

  // Unauthenticated users cannot follow/unfollow
  if (session.status === 'unauthenticated') return null;

  // Show the follow button
  return (
    <Button
      className="min-w-fit"
      size="xs"
      color="secondary"
      disabled={isLoading}
      aria-label={generateText(followingState.data)}
      onPress={onPress}
    >
      {generateText(followingState.data)}
    </Button>
  );
};
