import { Card, Text, Spacer, Input, Button } from '@nextui-org/react';
import { Page } from '@prisma/client';
import { GetServerSidePropsContext, NextPage } from 'next';
import { getSession, useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { api } from '../utils/api';
import { useForm, SubmitHandler } from 'react-hook-form';
import { generateUsername } from '../common/generate-username';
import { Entries, Simplify } from 'type-fest';
import { useTranslation } from 'react-i18next';

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context);
  if (!session?.user) return { props: {} };

  // Get the session's settings
  const user = await prisma?.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      handle: true,
      email: true,
      emailVerified: true,
      page: true,
    },
  });

  if (!user) return null;

  return {
    props: {
      ...user,
      emailVerified: user.emailVerified !== null,
    },
  };
};

type Inputs = {
  handle: string;
  email: string;
};

const Settings: NextPage<{
  handle: string;
  email: string;
  emailVerified: boolean;
  page: Page;
}> = (props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, dirtyFields },
  } = useForm<Inputs>({
    defaultValues: {
      handle: props.handle,
      email: props.email,
    },
  });
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const modifiedData = Object.fromEntries(
      (Object.entries(dirtyFields) as Entries<Partial<typeof dirtyFields>>).map(
        ([field]) => [field, data[field]]
      )
    ) as Partial<Inputs>;

    // Post to server
    updateSettings.mutate(modifiedData, {
      onError(error) {
        console.log('oh no', error);
        // setError(error.message);
      },
      onSuccess() {
        router.reload();
        // TODO: tell user they did good :)
      },
    });
  };

  const { status } = useSession();
  const updateSettings = api.user.updateSettings.useMutation();

  // Don't show for unauthenticated users
  if (status !== 'authenticated') return null;
  if (props === null) return null;

  return (
    <>
      <Head>
        <title>{t('page.settings.title')}</title>
      </Head>
      <div className="flex flex-col items-center justify-center">
        <Card css={{ mw: '420px', p: '20px' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Text
              size={24}
              weight="bold"
              css={{
                as: 'center',
                mb: '20px',
              }}
            >
              {t('page.settings.heading')}
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
              {...register('handle', { required: true, maxLength: 25 })}
              helperText={errors.handle?.message ?? ''}
              placeholder={generateUsername()}
            />
            <Spacer y={2} />
            {/* Email */}
            <Input
              clearable
              bordered
              fullWidth
              color={props.emailVerified ? 'success' : 'primary'}
              status="default"
              size="lg"
              labelLeft={props.emailVerified ? '✅' : '❌'}
              {...register('email', { required: true })}
              disabled={props.emailVerified}
              helperText={errors.handle?.message ?? ''}
              placeholder={t('placeholder.email-address')!}
            />
            <Spacer y={2} />
            {/* {error && (
              <>
                <p>{error}</p>
                <Spacer y={1} />
              </>
            )} */}
            <Button
              className="min-w-full"
              type="submit"
              disabled={updateSettings.isLoading}
            >
              {t('update-settings')}
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
};

export default Settings;
