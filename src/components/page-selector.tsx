import { Card, Grid, Row, Text } from '@nextui-org/react';
import { useRouter } from 'next/router';
import { api } from '../utils/api';

export default function App() {
    const router = useRouter();
    const pages = api.page.getUsersPages.useQuery();
    const session = api.session.setPage.useMutation();
    const onClick = async (handle: string) => {
        await session.mutateAsync({
            handle
        });
        await router.push(`/@${handle}`);
    };

    if (pages.isLoading) return null;

    return (
        <Grid.Container gap={2} justify="flex-start">
            {pages.data?.length === 0 && 'Create a page to get started!'}
            {pages.data?.map(page => (
                // TODO: Idk what the xs and sm should be but this ain't it
                <Grid key={page.id}>
                    <Card
                        isPressable
                        onClick={() => void onClick(page.handle)}
                    >
                        <Card.Body css={{ p: 0 }}>
                            <Card.Image
                                src={'https://nextui.org/images/card-example-5.jpeg'}
                                objectFit="cover"
                                width="100%"
                                height={140}
                                alt={page.name || `@${page.handle}`}
                            />
                        </Card.Body>
                        <Card.Footer css={{ justifyItems: 'flex-start' }}>
                            <Row wrap="wrap" justify="space-between" align="center">
                                <Text b>{page.name || `@${page.handle}`}</Text>
                                <Text>{page.followerCount}</Text>
                            </Row>
                        </Card.Footer>
                    </Card>
                </Grid>
            ))}
        </Grid.Container>
    );
}