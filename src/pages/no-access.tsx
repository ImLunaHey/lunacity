import { useSSR } from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

const NoAccess: FC = () => {
    const { t } = useTranslation();
    const { data: session } = useSession();
    const { isBrowser } = useSSR();

    // Don't render the navbar when we're within SSR
    // See: https://github.com/nextui-org/nextui/issues/779
    if (!isBrowser) return null;

    return (
        <>
            <pre>{JSON.stringify(session, null, 2)}</pre>
            <div>{t('no-access')}</div>
        </>
    )
}

export default NoAccess;
