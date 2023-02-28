import i18nNext, { type InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend, { type HttpBackendOptions } from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import getConfig from 'next/config';
import Pseudo from 'i18next-pseudo';
import { env } from '@app/env.mjs';

const { publicRuntimeConfig } = getConfig() as { publicRuntimeConfig: { APP_URL: string; WS_URL: string; } };
const { APP_URL } = publicRuntimeConfig;

const options = {
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar', 'cn', 'es', 'pt'],
    debug: !!env.NEXT_PUBLIC_LANG_DEBUG,
    defaultNS: 'common',
    returnNull: false,
    load: 'languageOnly' as const,
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
    },
    detection: {
        caches: []
    },
    postProcess: ['pseudo'],
} satisfies InitOptions<HttpBackendOptions>;

export const i18n = i18nNext
    .use(new Pseudo({
        enabled: env.NEXT_PUBLIC_PSUDO_ENABLED === 'true',
        languageToPseudo: 'en-US',
    }))
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
    .init<HttpBackendOptions>(options);
