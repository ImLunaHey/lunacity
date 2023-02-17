// import the original type declarations
import 'react-i18next';
// import all namespaces (for the default language, only)
import type common from 'locales/en/common.json';

declare module 'react-i18next' {
    interface CustomTypeOptions {
        // custom namespace type if you changed it
        defaultNS: 'common';
        // custom resources type
        resources: {
            common: typeof common;
        };
    }
}
