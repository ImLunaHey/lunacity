import { withRoleAccess } from '@app/common/with-role-access';
import { api } from '@app/utils/api';
import type { NextPage } from 'next';

export const getServerSideProps = withRoleAccess('ADMIN')();

const Reports: NextPage = () => {
    const { data } = api.admin.getReports.useQuery();

    return (<>
        <pre>{JSON.stringify(data, null, 2)}</pre>
    </>)
}

export default Reports;
