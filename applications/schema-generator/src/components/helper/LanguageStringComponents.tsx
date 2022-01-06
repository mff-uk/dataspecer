import React, {ReactElement} from "react";
import {useTranslation} from "react-i18next";
import {LanguageString} from "@model-driven-data/core/lib/core";

export const LanguageStringFallback: React.FC<{
    from: LanguageString | null,
    fallback?: ReactElement,
    children?: (text: string, lang?: string) => ReactElement,
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
    children: (text: string|undefined, lang?: string) => ReactElement,
}> = ({from, children}) => <LanguageStringFallback from={from} fallback={children(undefined, undefined)}>{children}</LanguageStringFallback>;

export const LanguageStringText: React.FC<{from: LanguageString | null}> = ({from}) => <LanguageStringFallback from={from}>{text => <>{text}</>}</LanguageStringFallback>;
