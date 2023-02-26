import '@app/utils/i18n';

import type { AppType } from 'next/app';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { createTheme, Link, NextUIProvider } from '@nextui-org/react';
import { toast } from 'react-toastify';
import { api } from '@app/utils/api';
import '@app/styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head';
import Script from 'next/script';
import { Router, useRouter } from 'next/router';
import { useSSR } from '@nextui-org/react';
import dynamic from 'next/dynamic';

// 2. Call `createTheme` and pass your custom theme values
const theme = createTheme({
  type: 'dark',
});

const showRouteChangeToast = (url: string) => {
  toast(
    <span>
      Loading: <Link href={url}>{url}</Link>
    </span>,
    { delay: 100 }
  );
};

const Application: AppType<{ session: Session | null }> = ({
  Component: Page,
  pageProps: { session, ...pageProps },
}) => {
  const Navbar = dynamic(() => import('@app/components/navbar').then((pkg) => pkg.default));
  const ToastContainer = dynamic(() => import('react-toastify').then((pkg) => pkg.ToastContainer));
  const { isBrowser } = useSSR();
  const { route } = useRouter();

  // If we're in dev mode show route changes as toasts
  if (process.env.NODE_ENV === 'development') {
    Router.events.off('routeChangeStart', showRouteChangeToast);
    Router.events.on('routeChangeStart', showRouteChangeToast);
  }

  return (
    <NextUIProvider theme={theme}>
      {/* Poll the session endpoint every 5 mins */}
      <SessionProvider session={session} refetchInterval={60 * 5}>
        <Head>
          <title>LunaCity</title>
          <meta name="description" content="Social Media site" />
          <link rel="icon" href="/favicon.ico" />
          {/* Analytics script */}
          {isBrowser && (
            <Script
              id="analytics"
              defer
              data-domain="lunacity.app"
              src="https://plausible.io/js/script.js"
              strategy="afterInteractive"
            />
          )}
        </Head>
        <Navbar {...pageProps} />
        <main className={['container mx-auto mt-2 ', route.startsWith('/admin') ? '' : 'w-4/5 max-w-2xl'].join(' ')}>
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
