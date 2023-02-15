import { withPrivateAccess } from '@app/common/with-private-access';
import { Card, Text, Spacer, Input, Button, Textarea } from '@nextui-org/react';
import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { generateUsername } from '../../common/generate-username';
import { api } from '../../utils/api';

export const getServerSideProps = withPrivateAccess();

// @TODO: Replace the useState calls with useForm
const CreatePage: NextPage = () => {
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const { status } = useSession();
  const router = useRouter();
  const createPage = api.page.createPage.useMutation();

  if (status !== 'authenticated') return null;

  return (
    <>
      <Head>
        <title>Create a new page</title>
      </Head>
      <div className="flex flex-col items-center justify-center">
        <Card css={{ mw: '420px', p: '20px' }}>
          <form
            onSubmit={(event) => {
              event.preventDefault();

              // Post to server
              createPage.mutate(
                {
                  displayName,
                  handle,
                  description,
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
                mb: '20px',
              }}
            >
              Create a new page
            </Text>
            {/* Handle */}
            <Input
              clearable
              bordered
              fullWidth
              color="primary"
              status="default"
              size="lg"
              labelLeft="@"
              maxLength={25}
              value={handle}
              onChange={(event) => {
                setHandle(event.target.value);
                setError('');
              }}
              onKeyDown={(event) => {
                // Only allow a-z 0-9 _ and .
                if (/^[a-z0-9_.]+$/.test(event.key)) return;
                if (event.key === 'Backspace') return;
                if (event.key === 'Enter') return;
                if (event.key === 'Tab') return;
                event.preventDefault();
              }}
              helperText="TODO: This text"
              placeholder={generateUsername()}
            />
            <Spacer y={2} />
            {/* Display name */}
            <Input
              clearable
              bordered
              fullWidth
              color="primary"
              size="lg"
              maxLength={50}
              value={displayName}
              onChange={(event) => {
                setDisplayName(event.target.value);
                setError('');
              }}
              placeholder={`@${handle}`}
              helperText="The display name"
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
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setError('');
                return true;
              }}
              // @TODO: make the placeholder better, wtf even is this?
              placeholder="Add your socials here?"
              helperText="The page description"
            />
            <Spacer y={2} />
            {error && (
              <>
                <p>{error}</p>
                <Spacer y={1} />
              </>
            )}
            <Button className="min-w-full" type="submit" disabled={createPage.isLoading}>
              Create Page
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
};

export default CreatePage;
