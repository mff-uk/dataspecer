import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import cs from './i18n/cs.json';
import en from './i18n/en.json';
import LanguageDetector from 'i18next-browser-languagedetector';

const languages = ['cs', 'en'];

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {cs, en},
        fallbackLng: 'en',
        whitelist: languages,

        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
    });

export default i18n;
export {languages};
