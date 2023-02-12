import { withAuth } from '@app/common/with-auth';
import { Card, Text, Spacer, Input, Button, Grid, Textarea, Dropdown, Loading } from '@nextui-org/react';
import { Page } from '@prisma/client';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import { api } from '../../utils/api';

export const getServerSideProps = withAuth();

const PageSelector: FC<{
  pages: Page[];
  onChanged: (handle: string) => void;
}> = ({ pages, onChanged }) => {
  const [selected, setSelected] = useState<string | null>(pages[0]?.handle!);

  // Don't mount unless we have all the data we need
  if (!pages[0]?.handle || !selected) return null;

  useEffect(() => {
    onChanged(selected);
  }, [selected]);

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

function CreatePost() {
  const [handle, setHandle] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedPostType, setSelectedPostType] = useState<'text' | 'image'>('text');
  const { status } = useSession();
  const router = useRouter();
  const createPost = api.post.createPost.useMutation();
  const getUsersPages = api.page.getUsersPages.useQuery();

  // Redirect unauthenticated users to the signin page
  if (status === 'unauthenticated') return void router.push('/api/auth/signin?callbackUrl=/post/create');

  // Show loading element while session is loaded
  if (status === 'loading' || getUsersPages.isLoading) return <Loading />;

  // If we have no pages tell the user to go make one
  if (getUsersPages.data?.length === 0) return void router.push('/page/create');

  return (
    <>
      <Head>
        <title>Create a new post</title>
      </Head>
      <div className="flex flex-col items-center justify-center pt-20">
        <Card css={{ mw: '420px', p: '20px' }}>
          <form
            onSubmit={(event) => {
              event.preventDefault();

              // Create a new post on the server
              createPost.mutate(
                {
                  page: {
                    handle,
                  },
                  post: {
                    title,
                    body,
                    tags: [],
                    type: 'text',
                  },
                },
                {
                  onError(error) {
                    setError(error.message);
                  },
                  async onSuccess() {
                    await router.push(`/@${handle}`);
                  },
                }
              );
            }}
          >
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
              <PageSelector pages={getUsersPages.data ?? []} onChanged={(handle) => setHandle(handle)} />
            </Grid.Container>

            <Grid.Container gap={2} justify="center">
              {['text' as const, 'image' as const].map((postType) => (
                <Grid key={postType}>
                  <Button
                    onPress={() => setSelectedPostType(postType)}
                    color={selectedPostType === postType ? 'success' : 'primary'}
                    auto
                  >
                    {postType}
                  </Button>
                </Grid>
              ))}
            </Grid.Container>

            {/* Text Post */}
            {selectedPostType === 'text' && (
              <>
                {/* Title */}
                <Input
                  aria-label="Post title"
                  bordered
                  fullWidth
                  color="primary"
                  status="default"
                  size="lg"
                  maxLength={25}
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setError('');
                  }}
                  helperText="Post title"
                  placeholder="An amazing title!"
                />
                <Spacer y={2} />
                {/* Body */}
                <Textarea
                  aria-label="Post body"
                  bordered
                  fullWidth
                  color="primary"
                  size="lg"
                  maxLength={100000}
                  value={body}
                  onChange={(event) => {
                    setBody(event.target.value);
                    setError('');
                    return true;
                  }}
                  placeholder="A wild thought, markdown works here!"
                  helperText="The text body"
                />
              </>
            )}

            {/* Image Post */}
            {selectedPostType === 'image' && (
              <>
                {/* Title */}
                <Input
                  aria-label="Post title"
                  bordered
                  fullWidth
                  color="primary"
                  status="default"
                  size="lg"
                  maxLength={25}
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setError('');
                  }}
                  helperText="Post title"
                  placeholder="An amazing title!"
                />
                <Spacer y={2} />
                {/* Image */}
                {/* TODO: Add an image selector here */}
                {/* <Input
                    aria-label='Post select image'
                    bordered
                    fullWidth
                    color="primary"
                    status='default'
                    size="lg"
                    maxLength={25}
                    value={handle}
                    type="file"
                    onChange={(event) => {
                        // @TODO: Workout how to get the image data so we can send a mutation with it
                        // setImage(event.target.value);
                        setError('');
                    }}
                    helperText="An image"
                    placeholder=""
                />
                <Spacer y={2} /> */}
                <Input
                  aria-label="Post image URL"
                  bordered
                  fullWidth
                  color="primary"
                  status="default"
                  size="lg"
                  maxLength={25}
                  value={imageUrl}
                  labelLeft="http(s)://"
                  onChange={(event) => {
                    setImageUrl(event.target.value);
                    setError('');
                  }}
                  helperText="URL of existing image (e.g. imgur)"
                  placeholder="Image URL"
                />
              </>
            )}

            <Spacer y={2} />
            {error && (
              <>
                <p>Error: {error}</p>
                <Spacer y={1} />
              </>
            )}
            <Button className="min-w-full" type="submit" disabled={createPost.isLoading}>
              Post!
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}

export default CreatePost;
