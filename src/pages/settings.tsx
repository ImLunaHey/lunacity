import { Card, Text, Spacer, Input, Button, Modal } from '@nextui-org/react';
import { type Page } from '@prisma/client';
import type { NextPage } from 'next';
import { getSession, signOut, useSession } from 'next-auth/react';
import Head from 'next/head';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../utils/api';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { generateUsername } from '../common/generate-username';
import type { Entries } from 'type-fest';
import { useTranslation } from 'react-i18next';
import { withPrivateAccess } from '@app/common/with-private-access';
import { prisma } from '@app/server/db';
import { refreshSession } from '@app/common/refresh-session';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useState } from 'react';

export const getServerSideProps = withPrivateAccess(async (context) => {
  const session = await getSession(context);
  if (!session?.user) return { props: {} };

  // Get the session's settings
  const user = await prisma?.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      email: true,
      emailVerified: true,
      page: true,
    },
  });

  if (!user) return { props: {} };

  return {
    props: {
      ...user,
      emailVerified: user.emailVerified !== null,
    } as const,
  };
});

type Inputs = {
  handle: string;
  email: string;
  displayName: string;
};

const SettingsInput = z
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
  })
  .required();

const Settings: NextPage<{
  handle: string;
  email: string;
  emailVerified: boolean;
  page: Page;
}> = (props) => {
  const { status } = useSession();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors, dirtyFields },
  } = useForm<Inputs>({
    defaultValues: {
      handle: props.handle,
      email: props.email,
      displayName: props.page.displayName,
    },
    mode: 'all',
    resolver: zodResolver(SettingsInput),
  });
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const modifiedData = Object.fromEntries(
      (Object.entries(dirtyFields) as Entries<Partial<typeof dirtyFields>>).map(([field]) => [field, data[field]])
    ) as Partial<Inputs>;

    // Post to server
    updateSettings.mutate(modifiedData, {
      onError(error) {
        console.log('oh no', error);
        // setError(error.message);
      },
      onSuccess() {
        refreshSession();
        resetForm(modifiedData);
        toast.success(t('page.settings.update.success'));
      },
    });
  };

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const modalCloseHandler = () => {
    setModalVisible(false);
  };

  // Dectivate account
  const deactivateAccount = api.user.deactivateAccount.useMutation();
  const onDeactivateAccountPress = () => {
    setModalVisible(true);
  };
  const onDeactivateAccountConfirmPress = () => {
    deactivateAccount.mutate(undefined, {
      onSuccess() {
        toast.success(t('page.settings.deactivate.success'));

        // Sign the user out of their current session
        void signOut({ callbackUrl: '/bye', redirect: true });
      },
    });
  };

  const updateSettings = api.user.updateSettings.useMutation();

  const isLoading = deactivateAccount.isLoading || updateSettings.isLoading;
  const submitDisabled = isLoading || Object.keys(errors).length !== 0 || Object.keys(dirtyFields).length === 0;

  // Don't show for unauthenticated users
  if (status !== 'authenticated') return null;
  if (props === null) return null;

  return (
    <>
      <Head>
        <title>{t('page.settings.title')}</title>
      </Head>
      <div className="flex flex-col items-center justify-center">
        {/* User settings */}
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
              {t('page.settings.user-settings')}
            </Text>
            {/* Handle */}
            <Input
              clearable
              bordered
              fullWidth
              color={errors.handle ? 'error' : 'primary'}
              status="default"
              size="lg"
              labelLeft="@"
              {...register('handle', { required: true })}
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
              {...register('email')}
              disabled={props.emailVerified}
              helperText={errors.email?.message ?? ''}
              placeholder={t('placeholder.email-address') ?? 'placeholder.email-address'}
            />
            <Spacer y={2} />
            {/* {error && (
              <>
                <p>{error}</p>
                <Spacer y={1} />
              </>
            )} */}
            <Button className="min-w-full" type="submit" disabled={submitDisabled}>
              {t('update-settings')}
            </Button>
          </form>
        </Card>

        <Spacer y={0.5} />

        {/* User page settings */}
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
              {t('page.settings.user-page-settings')}
            </Text>
            {/* Display name */}
            <Input
              clearable
              bordered
              fullWidth
              color={errors.displayName ? 'error' : 'primary'}
              status="default"
              size="lg"
              {...register('displayName', { required: true, maxLength: 25 })}
              helperText={errors.displayName?.message ?? ''}
              placeholder={generateUsername()}
            />

            <Spacer y={2} />

            <Button className="min-w-full" type="submit" disabled={submitDisabled}>
              {t('update-settings')}
            </Button>
          </form>
        </Card>

        <Spacer y={0.5} />

        <Card css={{ mw: '420px', p: '20px' }}>
          <Button
            onPress={onDeactivateAccountPress}
            color="error"
            className="min-w-full"
            type="submit"
            disabled={isLoading}
          >
            {t('page.settings.deactivate-account')}
          </Button>
        </Card>
      </div>

      <Modal closeButton aria-labelledby="modal-title" open={modalVisible} onClose={modalCloseHandler}>
        <Modal.Body>
          <Text>Are you sure you want to deactivate your account?</Text>
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onPress={onDeactivateAccountConfirmPress}>
            Deactivate
          </Button>
          <Button auto onPress={modalCloseHandler}>
            Oops
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Settings;
