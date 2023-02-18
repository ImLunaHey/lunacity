import i18nNext from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend, { type HttpBackendOptions } from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import getConfig from 'next/config';
import { env } from 'process';

const { publicRuntimeConfig } = getConfig() as { publicRuntimeConfig: { APP_URL: string; WS_URL: string; } };
const { APP_URL } = publicRuntimeConfig;

export const i18n = i18nNext
    // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
    // learn more: https://github.com/i18next/i18next-http-backend
    .use(Backend)
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init<HttpBackendOptions>({
        fallbackLng: 'en',
        supportedLngs: ['en'],
        debug: env.NODE_ENV !== 'production',
        defaultNS: 'common',
        load: 'languageOnly',
        react: {
            useSuspense: false,
        },
        ns: ['common'],
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        nonExplicitSupportedLngs: true,
        backend: {
            loadPath: `${APP_URL}/locales/{{lng}}/{{ns}}.json`,
        }
    });
