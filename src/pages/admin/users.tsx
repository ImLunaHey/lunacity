import { withRoleAccess } from '@app/common/with-role-access';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { DeleteIcon } from '@app/components/icons/delete-icon';
import { EditIcon } from '@app/components/icons/edit-icon';
import { EyeIcon } from '@app/components/icons/eye-icon';
import { api, type RouterOutputs } from '@app/utils/api';
import { Table, Row, Col, Tooltip, User, Text } from '@nextui-org/react';
import { StyledBadge } from '@app/components/styled-badge';
import { IconButton } from '@app/components/icon-button';
import type { NextPage } from 'next';
import type { ReactNode } from 'react';

export const getServerSideProps = withRoleAccess('ADMIN')();

const columns = [
    { name: 'NAME', uid: 'name' },
    { name: 'ROLE', uid: 'role' },
    { name: 'STATUS', uid: 'status' },
    { name: 'ACTIONS', uid: 'actions' },
] as const;

const renderCell = (user: RouterOutputs['admin']['getUsers'][number], columnKey: string): string | ReactNode => {
    switch (columnKey) {
        case 'name':
            return (
                <User
                    squared
                    bordered
                    color={user.page?.official ? 'secondary' : 'primary'}
                    src={user.page?.image ?? 'https://nextui.org/images/card-example-5.jpeg'}
                    name={user.page?.handle ?? 'N/A'}
                    css={{ p: 0 }}>
                    {user.email}
                </User>
            );
        case 'role':
            return (
                <Col>
                    <Row>
                        <Text b size={14} css={{ tt: 'capitalize' }}>
                            {user.role}
                        </Text>
                    </Row>
                </Col>
            );
        case 'status':
            return <StyledBadge type={user.emailVerified ? 'active' : 'vacation'}>{user.emailVerified !== null ? 'Email verified' : 'Email unverified'}</StyledBadge>;

        case 'actions':
            return (
                <Row justify="center" align="center">
                    <Col css={{ d: 'flex' }}>
                        <Tooltip content="Impersonate">
                            <IconButton onClick={() => console.log('View user', user.id)}>
                                <EyeIcon size={20} fill="#979797" />
                            </IconButton>
                        </Tooltip>
                    </Col>
                    <Col css={{ d: 'flex' }}>
                        <Tooltip content="Edit user">
                            <IconButton onClick={() => console.log('Edit user', user.id)}>
                                <EditIcon size={20} fill="#979797" />
                            </IconButton>
                        </Tooltip>
                    </Col>
                    <Col css={{ d: 'flex' }}>
                        <Tooltip
                            content="Delete user"
                            color="error"
                            onClick={() => console.log('Delete user', user.id)}
                        >
                            <IconButton>
                                <DeleteIcon size={20} fill="#FF0080" />
                            </IconButton>
                        </Tooltip>
                    </Col>
                </Row>
            );
        default:
            return String(user[columnKey as keyof RouterOutputs['admin']['getUsers'][number]]);
    }
};

const Users: NextPage = () => {
    const { data: users, status } = api.admin.getUsers.useQuery();

    if (status === 'loading') return <LoadingSpinner />;

    return (
        <Table
            aria-label="Users table"
            css={{
                height: 'auto',
                minWidth: '100%',
            }}
            selectionMode="none"
        >
            <Table.Header columns={[...columns]}>
                {(column) => (
                    <Table.Column
                        key={column.uid}
                        hideHeader={column.uid === 'actions'}
                        align={column.uid === 'actions' ? 'center' : 'start'}
                    >
                        {column.name}
                    </Table.Column>
                )}
            </Table.Header>
            <Table.Body items={users}>
                {(user) => (
                    <Table.Row>
                        {(field) => (
                            <Table.Cell>{renderCell(user, String(field))}</Table.Cell>
                        )}
                    </Table.Row>
                )}
            </Table.Body>
        </Table>
    );
}

export default Users;
