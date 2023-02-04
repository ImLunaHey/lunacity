import { type NextPage } from 'next';
import Head from 'next/head';
import { signIn, useSession } from 'next-auth/react';
import { Button } from '@nextui-org/react';
import PageSelector from '../components/page-selector';
import Link from 'next/link';

const Home: NextPage = () => {
  const { data: sessionData } = useSession();

  // Unauthenticated user
  if (!sessionData) {
    return (
      <>
        <Head>
          <title>Social Network</title>
        </Head>
        <main className="flex min-h-screen flex-col items-center justify-center">
          <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
            <div className="flex flex-col items-center justify-center gap-4">
              <Button onClick={() => void signIn()}>Signin</Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Authenticated user
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <main className="flex flex-col items-center justify-center container gap-12 px-4 py-4 pt-4">
        {/* Might be a better way to align this using flex */}
        {/* This will be a + for adding a new page */}
        <div className='container px-5'>
          <Link className="p-2 bg-white text-black rounded-md float-right" href="/page/create">Create a new page</Link>
        </div>
        {/* TODO: We want card buttons to show the pages this user has access to */}
        <PageSelector />
      </main>
    </>
  )  
};

export default Home;
