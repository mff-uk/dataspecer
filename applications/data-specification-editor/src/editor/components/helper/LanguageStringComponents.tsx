import React, {ReactNode} from "react";
import {useTranslation} from "react-i18next";
import {LanguageString} from "@dataspecer/core/core";

export const LanguageStringFallback: React.FC<{
    from: LanguageString | null,
    fallback?: ReactNode,
    children?: (text: string, lang?: string) => ReactNode,
}> = ({from, fallback, children}) => {
    const {i18n} = useTranslation();

    if (from) {
        const toTry = [i18n.language, 'en', ...Object.keys(from)];

        for (const tryLang of toTry) {
            if (from[tryLang] && from[tryLang].length) {
                return children ? children(from[tryLang], tryLang) : <>{from[tryLang]}</>;
            }
        }
    }

    return fallback ?? null;
};

export const LanguageStringUndefineable: React.FC<{
    from: LanguageString | null,
    children: (text: string|undefined, lang?: string) => ReactNode,
}> = ({from, children}) => <LanguageStringFallback from={from} fallback={children(undefined, undefined)}>{children}</LanguageStringFallback>;

export const LanguageStringText: React.FC<{from: LanguageString | null, fallback?: ReactNode}> = ({from, fallback}) => <LanguageStringFallback from={from} fallback={fallback}>{text => <>{text}</>}</LanguageStringFallback>;

/**
 * Returns most suitable translation for the given language string.
 * @param languageString
 * @param languages
 */
export const translateFrom = (languageString: LanguageString|undefined|null, languages: readonly string[]): string|undefined => {
    if (!languageString) {
        return undefined;
    }

    for (const lang of languages) {
        if (languageString[lang] && languageString[lang].length) {
            return languageString[lang];
        }
    }

    const keys = Object.keys(languageString);
    if (keys.length) {
        return languageString[keys[0]];
    } else {
        return undefined;
    }
}
