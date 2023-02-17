import { withPrivateAccess } from '@app/common/with-private-access';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Text, Spacer, Input, Button, Grid, Textarea, Dropdown } from '@nextui-org/react';
import type { Page } from '@prisma/client';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { type FC, useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { api } from '../../utils/api';

export const getServerSideProps = withPrivateAccess();

const PageSelector: FC<{
  pages: Page[];
  onChanged: (handle?: string) => void;
}> = ({ pages, onChanged }) => {
  const [selected, setSelected] = useState<string | undefined>(pages[0]?.handle);

  useEffect(() => {
    onChanged(selected);
  }, [onChanged, selected]);

  // Don't mount unless we have all the data we need
  if (!pages[0]?.handle || !selected) return null;

  return (
    <Dropdown>
      <Dropdown.Button flat color="primary">
        @{selected}
      </Dropdown.Button>
      <Dropdown.Menu
        aria-label="Where to post"
        color="secondary"
        disallowEmptySelection
        selectionMode="single"
        selectedKeys={selected}
        onSelectionChange={(handles) => {
          const handle = [...new Set(handles).values()][0]?.toString();
          if (!handle) return;
          setSelected(handle);
        }}
      >
        {pages
          .map((page) => page.handle)
          .map((handle) => (
            <Dropdown.Item key={handle}>@{handle}</Dropdown.Item>
          ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

const CreatePostInput = z.object({
  handle: z
    .string()
    .regex(/^[a-zA-Z0-9_\-]+$/, 'Your handle can only contain letters, numbers, hyphens and underscores.')
    .min(3, 'Your handle must be at least 3 characters long.')
    .max(32, 'Your handle must be no more than 32 characters long.'),
  title: z.string().min(3, 'Your title must be at least 3 characters long.'),
  body: z.string().max(5_000, 'The post body must be no more than 5,000 characters long.').optional(),
  image: z.string().optional(),
  type: z.union([
    z.literal('text'),
    z.literal('image')
  ])
});

type Input = z.infer<typeof CreatePostInput>;

const CreatePost = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Input>({
    defaultValues: {
      type: 'text'
    },
    mode: 'all',
    resolver: zodResolver(CreatePostInput),
  });

  const { status } = useSession();
  const router = useRouter();
  const createPost = api.post.createPost.useMutation();
  const getUsersPages = api.page.getUsersPages.useQuery();

  const onSubmit: SubmitHandler<Input> = (data) => {
    // Post to server
    createPost.mutate(
      {
        page: {
          handle: data.handle,
        },
        post: {
          title: data.title,
          body: data.body,
          tags: [],
          type: 'text',
        },
      },
      {
        onError(error) {
          toast.error(error.message);
        },
        async onSuccess() {
          await router.push(`/@${data.handle}`);
        },
      }
    );
  };

  // Redirect unauthenticated users to the signin page
  if (status === 'unauthenticated') return void router.push('/api/auth/signin?callbackUrl=/post/create');

  // Show loading element while session is loaded
  if (status === 'loading' || getUsersPages.isLoading) return <LoadingSpinner />;

  // If we have no pages tell the user to go make one
  if (getUsersPages.data?.length === 0) return void router.push('/page/create');

  return (
    <>
      <Head>
        <title>Create a new post</title>
      </Head>
      <div className="flex flex-col items-center justify-center pt-20">
        <Card css={{ mw: '420px', p: '20px' }}>
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Text
              size={24}
              weight="bold"
              css={{
                as: 'center',
              }}
            >
              Create a new post
            </Text>

            {/* Select where to post */}
            <Grid.Container justify="center">
              <PageSelector pages={getUsersPages.data ?? []} onChanged={(handle) => handle && setValue('handle', handle, {})} />
            </Grid.Container>

            <Grid.Container gap={2} justify="center">
              {['text' as const, 'image' as const].map((postType) => (
                <Grid key={postType}>
                  <Button
                    onPress={() => setValue('type', postType, {})}
                    color={watch('type') === postType ? 'success' : 'primary'}
                    auto
                  >
                    {postType}
                  </Button>
                </Grid>
              ))}
            </Grid.Container>

            {/* Text Post */}
            {watch('type') === 'text' && (
              <>
                {/* Title */}
                <Input
                  aria-label="Post title"
                  bordered
                  fullWidth
                  size="lg"
                  maxLength={25}
                  color={errors.title ? 'error' : 'primary'}
                  status="default"
                  {...register('title', { required: true })}
                  helperText={errors.title?.message ?? ''}
                  placeholder="An amazing title!"
                />
                <Spacer y={2} />
                {/* Body */}
                <Textarea
                  aria-label="Post body"
                  bordered
                  fullWidth
                  size="lg"
                  maxLength={100000}
                  color={errors.body ? 'error' : 'primary'}
                  status="default"
                  {...register('body', { required: true })}
                  helperText={errors.body?.message ?? ''}
                  placeholder="A wild thought, markdown works here!"
                />
              </>
            )}

            {/* Image Post */}
            {watch('type') === 'image' && (
              <>
                {/* Title */}
                <Input
                  aria-label="Post title"
                  bordered
                  fullWidth
                  size="lg"
                  maxLength={25}
                  color={errors.title ? 'error' : 'primary'}
                  status="default"
                  {...register('title', { required: true })}
                  helperText={errors.title?.message ?? ''}
                  placeholder="An amazing title!"
                />
                <Spacer y={2} />
                {/* Image */}
                {/* TODO: Add an image selector here */}
                {/* <Input
                  aria-label="Post select image"
                  bordered
                  fullWidth
                  size="lg"
                  maxLength={25}
                  color={errors.image ? 'error' : 'primary'}
                  status="default"
                  {...register('image', { required: true })}
                  helperText={errors.image?.message ?? ''}
                  type="file"
                  placeholder=""
                /> */}
                {/* <Spacer y={2} /> */}
                <Input
                  aria-label="Post image URL"
                  bordered
                  fullWidth
                  size="lg"
                  maxLength={25}
                  labelLeft="http(s)://"
                  color={errors.image ? 'error' : 'primary'}
                  status="default"
                  {...register('image', { required: true })}
                  helperText={errors.image?.message ?? ''}
                  placeholder="Image URL"
                />
              </>
            )}
            <Spacer y={2} />
            <Button className="min-w-full" type="submit" disabled={createPost.isLoading}>
              Post!
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
};

export default CreatePost;
