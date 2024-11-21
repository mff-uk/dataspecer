import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
// @ts-ignore - it is a virtual module handled by Vite
import resources from 'virtual:i18next-loader';

const languages = Object.keys(resources);

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        supportedLngs: languages,

        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
    }, () => {});

export default i18n;
export {languages};
