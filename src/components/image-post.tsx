import type { SinglePostProps } from '@app/components/single-post';
import { TagCloud } from '@app/components/tag-cloud';
import { PageAvatar } from '@app/components/page-avatar';
import { Card, Grid, Button, Text } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';

export const ImagePost: React.FC<{ post: SinglePostProps }> = ({ post }) => {
  const { t } = useTranslation();
  if (!post) return null;

  return (
    <Card css={{ p: '$6' }}>
      <Card.Header>
        <PageAvatar
          // @TODO: Fix this
          official={false}
          src={'https://nextui.org/images/card-example-5.jpeg'}
          name={post.page.displayName}
          handle={post.page.handle}
          description={post.page.description}
          followerCount={post.page.followerCount}
          followingCount={post.page.followingCount}
          popover={true}
        />
        <Grid.Container css={{ pl: '$6' }}>
          <Grid xs={12}>
            <Text h4>{post.page.displayName}</Text>
          </Grid>
        </Grid.Container>
      </Card.Header>
      <Card.Body css={{ py: '$2' }}>
        <div style={{ position: 'relative', width: '100%' }}>{/* <Image {...image} alt={image.alt} /> */}</div>
        {/* {body && (<ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>)} */}

        <Grid.Container alignItems="flex-start" gap={0.5}>
          <Grid>
            <TagCloud tags={post.tags} />
          </Grid>
        </Grid.Container>
      </Card.Body>
      <Card.Footer>
        <Grid.Container alignItems="flex-start" gap={0.5}>
          <Grid>
            <Button className="min-w-0" size="xs" color="default" aria-label={t('bookmark-post')}>
              🔖
            </Button>
          </Grid>
          <Grid>
            <Button className="min-w-0" size="xs" color="default" aria-label={t('add-reaction')}>
              ⭐
            </Button>
          </Grid>
          <Grid>
            <Button className="min-w-0" size="xs" aria-label={t('post-add-comment')}>
              💬
            </Button>
          </Grid>
        </Grid.Container>
      </Card.Footer>
    </Card>
  );
};
