import React, {ReactElement} from "react";
import {LanguageString} from "model-driven-data";
import {useTranslation} from "react-i18next";

export const LanguageStringFallback: React.FC<{
    from?: LanguageString,
    fallback?: ReactElement,
    children: (text: string, lang?: string) => ReactElement,
}> = ({from, fallback, children}) => {
    const {i18n} = useTranslation();

    if (from) {
        const toTry = [i18n.language, 'en', ...Object.keys(from)];

        for (const tryLang of toTry) {
            if (from[tryLang] && from[tryLang].length) {
                return children(from[tryLang], tryLang);
            }
        }
    }

    return fallback ?? null;
};

export const LanguageStringUndefineable: React.FC<{
    from?: LanguageString,
    children: (text: string|undefined, lang?: string) => ReactElement,
}> = ({from, children}) => <LanguageStringFallback from={from} fallback={children(undefined, undefined)}>{children}</LanguageStringFallback>
