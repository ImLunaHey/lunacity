import type { SinglePostProps } from '@app/components/single-post';
import { TagCloud } from '@app/components/tag-cloud';
import { TimeAgo } from '@app/components/time-ago';
import { PageAvatar } from '@app/components/page-avatar';
import { Button, Card, Dropdown, Grid, Link, Spacer, Text } from '@nextui-org/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';
import { api } from '@app/utils/api';
import { toast } from 'react-toastify';

export const TextPost: React.FC<{ post: SinglePostProps }> = ({ post }) => {
  const { t } = useTranslation();
  const deletePost = api.post.deletePost.useMutation();

  const onClickEditPost = (postId: string) => () => {
    // TODO: Implement edit post
    //       This should open a modal with the post title + body to edit
    //       and then update the post with the new title + body
    toast.info(t('todo-implement-edit-post'));
  };

  const onClickDeletePost = (postId: string) => () => {
    deletePost.mutate(
      { post: { id: postId } },
      {
        onSuccess() {
          toast.success(t('delete-post-success'));
        },
        onError() {
          toast.error(t('delete-post-failure'));
        },
      }
    );
  };

  if (!post) return null;

  return (
    <Card css={{ p: '$6', mb: '$8' }} role="region">
      <Card.Header>
        <Grid.Container justify="space-between" alignItems="center">
          <Grid>
            <PageAvatar
              official={post.page.official}
              src={post.page.image ?? 'https://nextui.org/images/card-example-5.jpeg'}
              name={post.page.displayName}
              handle={post.page.handle}
              popover={true}
              description={post.page.description}
              followerCount={post.page.followerCount}
              followingCount={post.page.followingCount}
            />
          </Grid>
          <Grid>
            <div className="-mt-10 -mr-1">
              <Dropdown placement="bottom-right">
                <Dropdown.Trigger>
                  <div className="p-2">&#8230;</div>
                </Dropdown.Trigger>
                <Dropdown.Menu aria-label="Post menu actions" color="secondary">
                  <Dropdown.Item key="edit-post" textValue={t('edit-post')}>
                    <Text b color="inherit" css={{ d: 'flex' }} onClick={onClickEditPost(post.id)}>
                      {t('edit-post')}
                    </Text>
                  </Dropdown.Item>
                  <Dropdown.Item key="delete-post" textValue={t('delete-post')}>
                    <Text b color="inherit" css={{ d: 'flex' }} onClick={onClickDeletePost(post.id)}>
                      {t('delete-post')}
                    </Text>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Grid>
        </Grid.Container>
      </Card.Header>
      <Card.Body css={{ py: '$2' }} className="break-words">
        <Text h4>{post.title}</Text>
        {post.body && <ReactMarkdown remarkPlugins={[[remarkGfm]]}>{post.body}</ReactMarkdown>}
      </Card.Body>
      <Card.Footer>
        <Grid.Container justify="space-between" alignItems="center">
          <Grid>
            <Grid.Container alignItems="flex-start" gap={0.5}>
              <Grid>
                <Button className="min-w-0" size="xs" color="default" aria-label={t('favourite')}>
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
            </Grid.Container>
          </Grid>
          <Grid>
            <Grid.Container alignItems="flex-end">
              {/* Created/Updated at */}
              <Grid>
                <Link href={`/@${post.page.handle}/${post.id}`}>
                  <TimeAgo createdAt={post.createdAt} updatedAt={post.updatedAt} />
                </Link>
              </Grid>
              <Spacer />
              <Grid>
                <TagCloud tags={post.tags} />
              </Grid>
            </Grid.Container>
          </Grid>
        </Grid.Container>
      </Card.Footer>
    </Card>
  );
};
