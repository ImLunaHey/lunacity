import { Badge, Link } from '@nextui-org/react';

export const TagCloud: React.FC<{ tags: { id: string; name: string; }[] }> = ({ tags }) => {
  return (
    <>
      {(tags).map(tag => <Badge isSquared key={tag.name}><Link className="text-white" href={`/tags/${tag.name}`}>#{tag.name}</Link></Badge>)}
    </>
  );
};
