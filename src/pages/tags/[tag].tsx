import type { NextPage } from 'next';

const Page: NextPage<{ tag: string; }> = ({ tag }) => {
    return <div>{tag}</div>;
};

export default Page;
