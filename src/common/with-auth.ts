import type { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { getSession } from 'next-auth/react';

export const withAuth = <Props extends Record<string, any>, T extends GetServerSideProps = GetServerSideProps>(fn?: T) => async (context: GetServerSidePropsContext<Props>) => {
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
