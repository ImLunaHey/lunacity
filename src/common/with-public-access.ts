import { getServerAuthSession } from '@app/server/auth';
import type { Dict } from '@trpc/server';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next'
import type { Session } from 'next-auth';

type Callback = (context: Parameters<GetServerSideProps>[0] & { session?: Session | null }) => ReturnType<GetServerSideProps> | Awaited<ReturnType<GetServerSideProps>>;

export const withPublicAccess = <Props extends Dict<string | string[]>, T extends Callback = Callback>(fn?: T) => {
    return async (context: GetServerSidePropsContext<Props>) => {
        const session = await getServerAuthSession(context);

        // If the user is signed in
        if (session) {
            // redirect them to the page creation page if they don't have a user page
            if (!session.user.page) {
                return {
                    redirect: {
                        destination: '/page/create',
                        permanent: false,
                    },
                };
            }
        }

        return (fn?.({ ...context, session }) ?? { props: { session } }) as ReturnType<T>;
    };
};
