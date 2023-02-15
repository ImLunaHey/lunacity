import type { Dict } from '@trpc/server';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';

type Callback = (context: Parameters<GetServerSideProps>[0] & { session: Session }) => ReturnType<GetServerSideProps> | Awaited<ReturnType<GetServerSideProps>>;

export const withPrivateAccess = <Props extends Dict<string | string[]>, T extends Callback = Callback>(fn?: T) => {
    return async (context: GetServerSidePropsContext<Props>) => {
        const session = await getSession({ req: context.req });
        if (!session) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                },
            };
        }
        return (fn?.({ ...context, session }) ?? { props: { session } }) as ReturnType<T>;
    };
};
