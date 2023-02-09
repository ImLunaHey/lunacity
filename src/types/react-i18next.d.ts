// import the original type declarations
import 'react-i18next';
// import all namespaces (for the default language, only)
import ns1 from 'locales/en/translation.json';

declare module 'react-i18next' {
    interface CustomTypeOptions {
        // custom namespace type if you changed it
        defaultNS: 'ns1';
        // custom resources type
        resources: {
            ns1: typeof ns1;
        };
    };
};
