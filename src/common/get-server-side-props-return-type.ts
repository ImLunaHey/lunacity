import { GetServerSidePropsContext } from 'next';

export type GetServerSidePropsReturnType<T extends ({ }: GetServerSidePropsContext) => Promise<{
    props: Record<string, any>;
}>> = Awaited<ReturnType<T>>['props'];
