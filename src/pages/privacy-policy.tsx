import type { NextPage } from 'next';
import { Card, Text } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy: NextPage = () => {
    const { t } = useTranslation();

    return (
        <Card>
            <Card.Body>
                <Text h1>{t('pages.privacy-policy.title')}</Text>
                <Text className="whitespace-pre-wrap">{t('pages.privacy-policy.intro')}</Text>

                <Text h2>{t('pages.privacy-policy.information-we-automatically-collect')}</Text>

                <Text h3>{t('pages.privacy-policy.non-personally-identifying')}</Text>
                <Text className="whitespace-pre-wrap">{t('pages.privacy-policy.non-personally-identifying-text')}</Text>

                <Text h3>{t('pages.privacy-policy.personally-identifying')}</Text>
                <Text className="whitespace-pre-wrap">{t('pages.privacy-policy.personally-identifying-text')}</Text>

                <Text h2>{t('pages.privacy-policy.required-information')}</Text>
                <Text className="whitespace-pre-wrap">{t('pages.privacy-policy.required-information-text')}</Text>

                <Text h2>{t('pages.privacy-policy.optional-information')}</Text>
                <Text className="whitespace-pre-wrap">{t('pages.privacy-policy.optional-information-text')}</Text>

                <Text h2>{t('pages.privacy-policy.account-contents')}</Text>
                <Text className="whitespace-pre-wrap">{t('pages.privacy-policy.account-contents-text')}</Text>

                <Text h2>{t('pages.privacy-policy.disclosure-of-personally-identifying-information')}</Text>
                <Text className="whitespace-pre-wrap">{t('pages.privacy-policy.disclosure-of-personally-identifying-information-text')}</Text>

                <Text h2>{t('pages.privacy-policy.cookies')}</Text>
                <Text className="whitespace-pre-wrap">{t('pages.privacy-policy.cookies-text')}</Text>

                <Text h2>{t('pages.privacy-policy.confidentiality-and-security')}</Text>
                <Text className="whitespace-pre-wrap">{t('pages.privacy-policy.confidentiality-and-security-text')}</Text>

                <Text h2>{t('pages.privacy-policy.deleting-your-information')}</Text>
                <Text>{t('pages.privacy-policy.deleting-your-information-text')}</Text>

                <Text h2>{t('pages.privacy-policy.changes')}</Text>
                <Text className="whitespace-pre-wrap">{t('pages.privacy-policy.changes-text')}</Text>

                <Text h2>{t('pages.privacy-policy.contacting-us')}</Text>
                <Text className="whitespace-pre-wrap">{t('pages.privacy-policy.contacting-us-text')}</Text>

                <Text h2>{t('pages.privacy-policy.creative-commons')}</Text>
                <Text className="whitespace-pre-wrap">{t('pages.privacy-policy.creative-commons-text')}</Text>
            </Card.Body>
        </Card>
    )
}

export default PrivacyPolicy;
