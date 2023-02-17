import '@app/utils/i18n';

import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { createTheme, Link, NextUIProvider } from '@nextui-org/react';
import { ToastContainer, toast } from 'react-toastify';
import { api } from '../utils/api';
import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/navbar';
import { Router } from 'next/router';
import { Suspense } from 'react';
import { LoadingSpinner } from '@app/components/loading-spinner';

// 2. Call `createTheme` and pass your custom theme values
const theme = createTheme({
  type: 'dark',
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

const Application: AppType<{ session: Session | null }> = ({
  Component: Page,
  pageProps: { session, ...pageProps },
}) => {
  const { t } = useTranslation(['common']);
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NextUIProvider theme={theme}>
        {/* Poll the session endpoint every 5 mins */}
        <SessionProvider session={session} refetchInterval={60 * 5}>
          <Head>
            <title>{t('site.title')}</title>
            <meta name="description" content="Social Media site" />
            <link rel="icon" href="/favicon.ico" />
            {/* Analytics script */}
            {typeof window !== 'undefined' && (
              <script id="analytics" defer data-domain="lunacity.app" src="https://plausible.io/js/script.js"></script>
            )}
          </Head>
          <Navbar {...pageProps} />
          <main className="container mx-auto mt-2 w-4/5 max-w-2xl">
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
    </Suspense>
  );
};

export default api.withTRPC(Application);
