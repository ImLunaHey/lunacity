import { withPrivateAccess } from '@app/common/with-private-access';
import { SendIcon } from '@app/components/icons/send-icon';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { api } from '@app/utils/api';
import { Card, Input, Spacer, styled } from '@nextui-org/react';
import type { GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from 'next';
import type { FC, FormEvent } from 'react';
import { useState, useRef, useEffect } from 'react';

const getProps = (context: GetServerSidePropsContext) => {
  return {
    props: {
      threadId: context.query.threadId?.toString(),
    },
  }
};

export const getServerSideProps = withPrivateAccess(getProps);

const SendButton = styled('button', {
  // reset button styles
  background: 'transparent',
  border: 'none',
  padding: 0,
  // styles
  width: '24px',
  margin: '0 10px',
  dflex: 'center',
  bg: '$primary',
  borderRadius: '$rounded',
  cursor: 'pointer',
  transition: 'opacity 0.25s ease 0s, transform 0.25s ease 0s',
  svg: {
    size: '100%',
    padding: '4px',
    transition: 'transform 0.25s ease 0s, opacity 200ms ease-in-out 50ms',
    boxShadow: '0 5px 20px -5px rgba(0, 0, 0, 0.1)',
  },
  '&:hover': {
    opacity: 0.8,
  },
  '&:active': {
    transform: 'scale(0.9)',
    svg: {
      transform: 'translate(24px, -24px)',
      opacity: 0,
    },
  },
});

const Messages: FC<{ threadId: string; }> = ({ threadId }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const messages = api.message.getThreadMessages.useQuery({ threadId });

  useEffect(() => {
    // Scroll to the bottom any time we get new messages
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show loading state while we fetch the message threads
  if (messages.isLoading) return <LoadingSpinner />;

  return (
    <>
      {messages.data?.map((message) => {
        return (<>
          <Card key={message.id} className="p-2">
            <p>{message.text}</p>
          </Card>
          <Spacer y={0.5} />
        </>
        );
      })}
      <div ref={bottomRef} />
    </>
  )
};

const ThreadId: NextPage<InferGetServerSidePropsType<typeof getProps>> = ({ threadId }) => {
  const trpc = api.useContext();
  const [text, setText] = useState('');
  const sendMessage = api.message.sendMessage.useMutation();

  const handleSend = (e: FormEvent) => {
    e.preventDefault();

    if (!threadId) return;

    sendMessage.mutate({ threadId, text }, {
      async onSuccess() {
        // Clear the input field
        setText('');

        // Refetch the messages
        await trpc.message.getThreadMessages.refetch({ threadId });
      }
    });
  };

  if (!threadId) return null;

  return (
    <div className="mb-10">
      <Messages threadId={threadId} />
      <form onSubmit={handleSend}>
        <Input
          width='100%'
          clearable
          value={text}
          color={sendMessage.error ? 'error' : 'primary'}
          status={sendMessage.error ? 'error' : 'default'}
          helperText={sendMessage.error?.message}
          onChange={(e) => setText(e.target.value)}
          contentRightStyling={false}
          placeholder="Type your message..."
          contentRight={
            <SendButton>
              <SendIcon />
            </SendButton>
          }
        />
      </form>
    </div>
  );
};

export default ThreadId;
