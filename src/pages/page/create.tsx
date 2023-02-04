import { Card, Text, Spacer, Input, Button } from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { api } from '../../utils/api';

function CreatePage() {
    const [name, setName] = useState('');
    const [handle, setHandle] = useState('');
    const [error, setError] = useState('');
    const { status } = useSession();
    const router = useRouter();
    const mutation = api.page.createPage.useMutation();

    if (status !== 'authenticated') return null;

    return (
        <>
            <Head>
                <title>Create a new page</title>
            </Head>
            <main className="flex min-h-screen flex-col items-center justify-center">
                <Card css={{ mw: '420px', p: '20px' }}>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();

                            // Post to server
                            mutation.mutate({
                                name,
                                handle,
                            }, {
                                onError(error) {
                                    setError(error.message);
                                },
                                async onSuccess() {
                                    await router.push(`/@${handle}`);
                                },
                            });
                        }}
                    >
                        <Text
                            size={24}
                            weight="bold"
                            css={{
                                as: 'center',
                                mb: '20px',
                            }}
                        >Create a new page</Text>
                        <Input
                            clearable
                            bordered
                            fullWidth
                            color="primary"
                            status='default'
                            size="lg"
                            labelLeft="@"
                            maxLength={25}
                            value={handle}
                            onChange={(event) => {
                                setHandle(event.target.value);
                                setError('');
                            }}
                            onKeyDown={(event) => {
                                // Only allow a-z 0-9 _ and .
                                if (/^[a-z0-9_.]+$/.test(event.key)) return;
                                if (event.key === 'Backspace') return;
                                if (event.key === 'Enter') return;
                                if (event.key === 'Tab') return;
                                event.preventDefault();
                            }}
                            helperText="Your @handle"
                            placeholder="cool_username"
                        />
                        <Spacer y={2} />
                        <Input
                            clearable
                            bordered
                            fullWidth
                            color="primary"
                            size="lg"
                            maxLength={50}
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value);
                                setError('');
                            }}
                            placeholder={`@${handle}`}
                            helperText='Your display name'
                        />
                        <Spacer y={2} />
                        {error && <><p>{error}</p><Spacer y={1} /></> }
                        <Button className='min-w-full' type="submit" disabled={mutation.isLoading}>Create Page</Button>
                    </form>
                </Card>
            </main>
        </>
    )
}

export default CreatePage;
