import type { Dict } from '@trpc/server';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { getSession } from 'next-auth/react';

type Callback = (context: Parameters<GetServerSideProps>[0]) => ReturnType<GetServerSideProps> | Awaited<ReturnType<GetServerSideProps>>;

export const withAuth = <Props extends Dict<string | string[]>, T extends Callback = Callback>(fn?: T) => {
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

        return (fn?.(context) ?? { props: {} }) as ReturnType<T>;
    };
};
