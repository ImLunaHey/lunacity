import { withPrivateAccess } from '@app/common/with-private-access';
import type { Role } from '@prisma/client';
import type { Dict } from '@trpc/server';
import type { GetServerSideProps } from 'next'
import type { Session } from 'next-auth';

type Callback = (context: Parameters<GetServerSideProps>[0] & { session: Session }) => ReturnType<GetServerSideProps> | Awaited<ReturnType<GetServerSideProps>>;

export const withRoleAccess = (role: Role) => <Props extends Dict<string | string[]>, T extends Callback = Callback>(fn?: T) => {
    return withPrivateAccess<Props>((context) => {
        // If the user doesn't have the correct role, redirect to the no-access page
        if (context.session.user.role !== role) {
            return {
                redirect: {
                    destination: '/no-access',
                    permanent: false,
                },
            };
        }

        // Otherwise, return the props from the callback
        return (fn?.(context) ?? { props: { session: context.session } }) as ReturnType<T>;
    });
};
