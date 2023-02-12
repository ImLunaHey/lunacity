import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { createTheme, Link, NextUIProvider } from '@nextui-org/react';
import { ToastContainer, toast } from 'react-toastify';

import { api } from '../utils/api';

import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head';
import i18n from 'i18next';
import { useTranslation, initReactI18next } from 'react-i18next';
import Navbar from '../components/navbar';
import { FollowedNotification } from '@app/components/notifications/followed-notification';
import { Router } from 'next/router';
import { useNotificationStore } from '@app/stores/notification';

// 2. Call `createTheme` and pass your custom theme values
const theme = createTheme({
  type: 'dark',
  theme: {
    colors: {
      test: '#000000',
    },
  },
});

// If we're in dev mode show route changes as toasts
if (process.env.NODE_ENV === 'development')
  Router.events.on('routeChangeStart', (url: string) => {
    toast(
      <span>
        Loading: <Link href={url}>{url}</Link>
      </span>,
      { delay: 100 }
    );
  });

const i18nInitData = {
  // the translations
  // (tip move them in a JSON file and import them,
  // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
  resources: {
    en: {
      translation: {
        'update-settings': 'Update settings',
        'create-post': 'Create a post',
        'create-page': 'Create a page',
        'no-more-posts': 'Yay! You have seen it all',
        unfollow: 'Unfollow',
        follow: 'Follow',
        signup: 'Signup',
        signin: 'Signin',
        signout: 'Signout',
        site: {
          title: 'Social Media Platform',
        },
        page: {
          home: {
            title: 'Home',
          },
          settings: {
            title: 'Settings',
            heading: 'Settings',
            'user-settings': 'User Settings',
            'user-page-settings': 'User Page Settings',
            'page-settings': 'Page Settings',
            'deactivate-account': 'Deactivate Account',
          },
          explore: {
            title: 'Explore',
          },
          messages: {
            title: 'Messages',
          },
          analytics: {
            title: 'Analytics',
          },
          help: {
            title: 'Help & Feedback',
          },
        },
      },
    },
  },
  lng: 'en', // if you're using a language detector, do not define the lng option
  fallbackLng: 'en',

  interpolation: {
    escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
  },
};

void i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init(i18nInitData);

const Application: AppType<{ session: Session | null; }> = ({
  Component: Page,
  pageProps: { session, ...pageProps },
}) => {
  const { t } = useTranslation();
  const addNotification = useNotificationStore((state) => state.addNotification);

  api.notification.getLiveNotifications.useSubscription(undefined, {
    onData({ notification }) {
      // @TODO: This should be a jsx per type
      if (!notification) return;

      // Save the notification to the store
      addNotification(notification);

      if (notification.type === 'FOLLOWED') toast(<FollowedNotification notification={notification} />, { delay: 100 });
    },
    onError(err) {
      console.log({ err });
    },
    enabled: session?.user?.id !== undefined,
  });

  return (
    <NextUIProvider theme={theme}>
      {/* Poll the session endpoint every 5 mins */}
      <SessionProvider session={session} refetchInterval={60 * 5}>
        <Head>
          <title>{t('site.title')}</title>
          <meta name="description" content="Social Media site" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Navbar {...pageProps} />
        <main className="container mx-auto mt-2 w-4/5 max-w-5xl">
          <Page {...pageProps} />
        </main>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </SessionProvider>
    </NextUIProvider>
  );
};

export default api.withTRPC(Application);
