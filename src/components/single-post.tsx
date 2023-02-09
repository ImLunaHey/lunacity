import { Card, Grid, Button, Spacer, Text, Badge } from '@nextui-org/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { humanTime } from '../common/human-time';
import { RouterOutputs } from '../utils/api';
import { FollowButton } from './follow-button';
import { TagCloud } from './tag-cloud';
import { UserAvatar } from './user-avatar';

export type SinglePostProps = RouterOutputs['post']['getPostDetails'];

export const TextPost: React.FC<SinglePostProps> = (props) => {
  if (!props) return null;

  // If the updated time isn't the same as the created time then it's been updated
  const hasUpdated = props.createdAt.getTime() !== props.updatedAt.getTime();

  return (
    <Card css={{ p: '$6', mb: '$8' }}>
      <Card.Header>
        <UserAvatar
          official={props.page.official}
          src={'https://nextui.org/images/card-example-5.jpeg'}
          name={props.page.displayName ?? `@${props.page.handle}`}
          handle={props.page.handle}
        />
        {/* Follow button */}
        <FollowButton handle={props.page.handle} />
        <Spacer x={0.2} />
        <Badge>
          {hasUpdated ? 'Updated' : 'Posted'}{' '}
          {humanTime(hasUpdated ? props.updatedAt : props.createdAt)}
        </Badge>
      </Card.Header>
      <Card.Body css={{ py: '$2' }}>
        <Text>{props.title}</Text>
        <ReactMarkdown remarkPlugins={[[remarkGfm]]}>
          {props.body}
        </ReactMarkdown>
      </Card.Body>
      <Card.Footer>
        <Grid.Container alignItems="flex-start" gap={0.5}>
          <Grid>
            <Button
              className="min-w-0"
              size="xs"
              color="default"
              aria-label="Favourite"
            >
              🔖
            </Button>
          </Grid>
          <Grid>
            <Button
              className="min-w-0"
              size="xs"
              color="default"
              aria-label="Star post"
            >
              ⭐
            </Button>
          </Grid>
          <Grid>
            <Button className="min-w-0" size="xs" aria-label="Comment on post">
              💬
            </Button>
          </Grid>
          <Grid>
            <TagCloud tags={props.tags} />
          </Grid>
        </Grid.Container>
      </Card.Footer>
    </Card>
  );
};

// export type ImagePostProps = {
//   id: string;
//   type: 'image';
//   page: {
//     name: string;
//     handle: string;
//   };
//   image: {
//     src: string;
//     width: number;
//     height: number;
//     alt: string;
//   };
//   body?: string;
//   tags: { id: string; name: string; }[];
// };

// export const ImagePost: React.FC<SinglePostProps> = ({ page, image, body, tags }) => {
//   return (
//     <Card css={{ p: '$6' }}>
//       <Card.Header>
//         <UserAvatar
//           // @TODO: Fix this
//           official={false}
//           src={'https://nextui.org/images/card-example-5.jpeg'}
//           name={page.name}
//           handle={page.handle}
//         />
//         <Grid.Container css={{ pl: '$6' }}>
//           <Grid xs={12}>
//             <Text h4>{page.name}</Text>
//           </Grid>
//         </Grid.Container>
//       </Card.Header>
//       <Card.Body css={{ py: '$2' }}>
//         <div style={{ position: 'relative', width: '100%' }} >
//           <Image {...image} alt={image.alt} />
//         </div>
//         {body && (<ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>)}

//         <Grid.Container alignItems='flex-start' gap={0.5}>
//           <Grid><TagCloud tags={tags} /></Grid>
//         </Grid.Container>
//       </Card.Body>
//       <Card.Footer>
//         <Grid.Container alignItems='flex-start' gap={0.5}>
//           <Grid><Button className='min-w-0' size='xs' color='default' aria-label='Favourite'>🔖</Button></Grid>
//           <Grid><Button className='min-w-0' size='xs' color='default' aria-label='Star post'>⭐</Button></Grid>
//           <Grid><Button className='min-w-0' size='xs' aria-label='Comment on post'>💬</Button></Grid>
//         </Grid.Container>
//       </Card.Footer>
//     </Card>
//   );
// };

export const SinglePost: React.FC<SinglePostProps> = (props) => {
  if (!props) return null;
  // if (props.type === 'gallery') return null;
  // if (props.type === 'image') return <ImagePost {...props} />;
  if (props?.type === 'text') return <TextPost {...props} />;
  // if (props.type === 'video') return null;
  return null;
};
