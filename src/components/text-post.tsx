import { FollowButton } from '@app/components/follow-button';
import { SinglePostProps } from '@app/components/single-post';
import { TagCloud } from '@app/components/tag-cloud';
import { TimeAgo } from '@app/components/time-ago';
import { UserAvatar } from '@app/components/user-avatar';
import { Button, Card, Grid, Link, Spacer, Text } from '@nextui-org/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const TextPost: React.FC<{ post: SinglePostProps }> = ({ post }) => {
  if (!post) return null;

  return (
    <Card css={{ p: '$6', mb: '$8' }} role="region">
      <Card.Header>
        <UserAvatar
          official={post.page.official}
          src={post.page.owner.image ?? 'https://nextui.org/images/card-example-5.jpeg'}
          name={post.page.displayName ?? `@${post.page.handle}`}
          handle={post.page.handle}
        />
        {/* Follow button */}
        <FollowButton handle={post.page.handle} />
        <Spacer x={0.2} />
        {/* Created/Updated at */}
        <Link href={`/@${post.page.handle}/${post.id}`}>
          <TimeAgo createdAt={post.createdAt} updatedAt={post.updatedAt} />
        </Link>
      </Card.Header>
      <Card.Body css={{ py: '$2' }} className="break-words">
        <Text>{post.title}</Text>
        <ReactMarkdown remarkPlugins={[[remarkGfm]]}>{post.body}</ReactMarkdown>
      </Card.Body>
      <Card.Footer>
        <Grid.Container alignItems="flex-start" gap={0.5}>
          <Grid>
            <Button className="min-w-0" size="xs" color="default" aria-label="Favourite">
              🔖
            </Button>
          </Grid>
          <Grid>
            <Button className="min-w-0" size="xs" color="default" aria-label="Star post">
              ⭐
            </Button>
          </Grid>
          <Grid>
            <Button className="min-w-0" size="xs" aria-label="Comment on post">
              💬
            </Button>
          </Grid>
          <Grid>
            <TagCloud tags={post.tags} />
          </Grid>
        </Grid.Container>
      </Card.Footer>
    </Card>
  );
};
