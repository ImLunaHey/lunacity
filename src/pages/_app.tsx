import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { createTheme, NextUIProvider } from '@nextui-org/react';

import { api } from '../utils/api';

import '../styles/globals.css';
import Head from 'next/head';
import Navbar from '../components/navbar';

// 2. Call `createTheme` and pass your custom theme values
const theme = createTheme({
  type: 'dark'
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <NextUIProvider theme={theme}>
      <SessionProvider session={session} refetchInterval={1}>
        <Head>
          <title>Social Media Site</title>
          <meta name="description" content="Social Media site" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Navbar {...pageProps} />
        <Component {...pageProps} />
      </SessionProvider>
    </NextUIProvider>
  );
};

export default api.withTRPC(MyApp);
