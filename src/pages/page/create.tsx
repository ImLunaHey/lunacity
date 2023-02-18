import { withPrivateAccess } from '@app/common/with-private-access';
import { Card, Text, Spacer, Input, Button, Textarea } from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { generateUsername } from '../../common/generate-username';
import { api } from '../../utils/api';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { refreshSession } from '@app/common/refresh-session';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const getServerSideProps = withPrivateAccess();

type Inputs = {
  handle: string;
  email: string;
  displayName: string;
  description: string;
};

const CreatePageInput = z
  .object({
    handle: z
      .string()
      .regex(/^[a-zA-Z0-9_\-]+$/, 'Your handle can only contain letters, numbers, hyphens and underscores.')
      .min(3, 'Your handle must be at least 3 characters long.')
      .max(32, 'Your handle must be no more than 32 characters long.'),
    displayName: z
      .string()
      .min(3, 'Your display name must be at least 3 characters long.')
      .max(32, 'Your display name must be no more than 32 characters long.'),
    description: z.string().max(100, 'Your page description must be no more than 100 characters long.'),
  })
  .required();

const CreatePage: NextPage = () => {
  const { t } = useTranslation(['common']);
  const router = useRouter();
  const createPage = api.page.createPage.useMutation();
  const generatedUsername = generateUsername();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      handle: generatedUsername,
      displayName: `@${generatedUsername}`,
    },
    mode: 'all',
    resolver: zodResolver(CreatePageInput),
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    // Post to server
    createPage.mutate(data, {
      onError(error) {
        toast.error(error.message);
      },
      async onSuccess() {
        refreshSession();
        toast.success(t('pages.create.success'));
        await router.push(`/@${data.handle}`);
      },
    });
  };

  return (
    <>
      <Head>
        <title>Create a new page</title>
      </Head>
      <div className="flex flex-col items-center justify-center">
        <Card css={{ mw: '420px', p: '20px' }}>
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <form onSubmit={handleSubmit(onSubmit)}>
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
              aria-label="Handle"
              clearable
              bordered
              fullWidth
              color={errors.handle ? 'error' : 'primary'}
              status="default"
              size="lg"
              labelLeft="@"
              maxLength={25}
              {...register('handle')}
              helperText={errors.handle?.message ?? ''}
            />
            <Spacer y={2} />
            {/* Display name */}
            <Input
              aria-label="Display name"
              clearable
              bordered
              fullWidth
              color={errors.displayName ? 'error' : 'primary'}
              size="lg"
              maxLength={50}
              {...register('displayName')}
              helperText={errors.displayName?.message ?? ''}
            />
            <Spacer y={2} />
            {/* Body */}
            <Textarea
              aria-label="Description"
              bordered
              fullWidth
              color={errors.description ? 'error' : 'primary'}
              size="lg"
              maxLength={100000}
              {...register('description', { required: true, maxLength: 25 })}
              // @TODO: make the placeholder better, wtf even is this?
              placeholder="Add your socials here?"
              helperText={errors.description?.message ?? ''}
            />
            <Spacer y={2} />
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
