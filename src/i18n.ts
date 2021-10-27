import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const context = require.context('../locales', true, /\.json$/);
const translations: {
    [locale: string]: {
        [namespace: string]: {}
    }
} = {};

for (const filename of context.keys()) {
    const [locale, namespace] = filename.substr(2, filename.length - 2 - 5).split("/"); // ./locale/namespace.json
    if (!translations[locale]) {
        translations[locale] = {};
    }
    translations[locale][namespace] = context(filename);
}

const languages = Object.keys(translations);

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: translations,
        fallbackLng: 'en',
        whitelist: languages,

        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
    });

export default i18n;
export {languages};
