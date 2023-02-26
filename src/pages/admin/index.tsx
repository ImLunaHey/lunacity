import { withRoleAccess } from '@app/common/with-role-access';
import type { NextPage } from 'next';
import Link from 'next/link';

export const getServerSideProps = withRoleAccess('ADMIN')();

const Dashboard: NextPage = () => {
    return (
        <>
            <div>Dashboard</div>
            <ul>
                <li><Link href="/admin/reports">Reports</Link></li>
                <li><Link href="/admin/users">Users</Link></li>
            </ul>
        </>
    );
};

export default Dashboard;
