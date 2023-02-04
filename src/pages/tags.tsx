import { api } from '../utils/api';
import { TagCloud } from '../components/tag-cloud';
import { Loading } from '@nextui-org/react';

const Tags = () => {
    const tags = api.tag.getAllTags.useQuery();

    // Show loading while we fetch data
    if (tags.isLoading) return (
        <main className="flex flex-col items-center justify-center">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-4 pt-4">
                <div className="flex flex-col items-center justify-center gap-4">
                    <Loading />
                </div>
            </div>
        </main>
    );

    return (
        <main className="flex flex-col items-center justify-center">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-4 pt-4">
                <div className="flex flex-col items-center justify-center gap-4">
                <TagCloud tags={tags.data ?? []} />
                </div>
            </div>
        </main>
    );
}

export default Tags;
