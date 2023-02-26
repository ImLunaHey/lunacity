import { withPrivateAccess } from '@app/common/with-private-access';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { api } from '@app/utils/api';
import { Avatar, Card, Grid, Input, Spacer, Text } from '@nextui-org/react';
import type { NextPage } from 'next';

export const getServerSideProps = withPrivateAccess();

const Messages: NextPage = () => {
  const friendsOnline: {
    src: string;
    name: string;
    description: string;
    handle: string;
    official: boolean;
    followerCount: number;
    followingCount: number;
    popover: boolean;
  }[] = [];
  const messageThreads = api.message.getAllMessageThreads.useQuery();

  // Show loading state while we fetch the message threads
  if (messageThreads.isLoading) return <LoadingSpinner />;

  // Show error state if something went wrong
  if (messageThreads.isError) return <div>Failed to load</div>;

  // Show empty state if there are no message threads
  if (messageThreads.data?.length === 0) return <div>No message threads</div>;

  // Show the message threads
  return (
    <Card>
      <Card.Body className="w-full p-5">
        <Grid.Container gap={1}>
          <Grid className="w-1/3">
            <Text h3 color="white">
              Chats
            </Text>
            <Input className="m-0 w-full bg-[#0A0A0A]" bordered clearable placeholder="Search" />
            <Spacer x={0.5} />
            <div>
              <Grid.Container gap={2} className="scrollbar-hide h-20 overflow-x-scroll overflow-y-scroll">
                {friendsOnline.map((friend) => (
                  <Grid key={friend.handle} className="inline-block ">
                    <Avatar
                      size="lg"
                      pointer
                      src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                      text={friend.handle}
                      stacked
                      bordered
                      color="success"
                    />
                  </Grid>
                ))}
              </Grid.Container>
            </div>
            <Spacer x={0.5} />
            <div>
              <Text h4 color="white">
                Recent chats
              </Text>
              {messageThreads.data?.map((messageThread) => (
                <Card className="p-8" key={messageThread.id}>
                  <Card.Body>
                    <Text h6 size={15} color="white" css={{ m: 0 }}>
                      {messageThread.messages[0]?.text}
                    </Text>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Grid>
          <Grid>This is where the messages go</Grid>
        </Grid.Container>
      </Card.Body>
    </Card>
  );
};

export default Messages;
