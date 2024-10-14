import type {
    LanguageString,
    SemanticModelClass,
    SemanticModelGeneralization,
    SemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import type {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { getDescriptionLanguageString, getNameLanguageString, getUsageNoteLanguageString } from "./name-utils";

/**
 * Tries to get a string from `languageString` in `preferredLanguage`.
 *
 * @param languageString
 * @param preferredLanguage
 * @returns [`translation`, `null`] if `preferredLanguage` exists
 * @returns [`translation`,`otherLanguage`] if `preferredLanguage` does not exist, but other language does
 * @returns [`null`,`null`] if `languageString` is empty or `null`
 */
export const getStringFromLanguageStringInLang = (
    languageString: LanguageString | null,
    preferredLanguage: string = "en"
) => {
    if (!languageString) {
        return [null, null] as const;
    }

    const result = languageString?.[preferredLanguage];
    if (result) {
        return [result, null] as const;
    }

    // get lang from lang hierarchy
    const nextLanguages = getLanguageHierarchy(preferredLanguage);
    for (const language of nextLanguages) {
        const possibleResult = languageString?.[language];
        if (possibleResult) {
            return [possibleResult, language] as const;
        }
    }

    // get any lang
    const languages = getAvailableLanguagesForLanguageString(languageString);
    const anyLanguage = languages.at(0);
    if (anyLanguage) {
        const value = languageString[anyLanguage]!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
        return [value, anyLanguage] as const;
    }

    return [null, null] as const;
};

/**
 * Creates a string from helper function `getStringFromLanguageStringInLang`
 * @param stringAndLang
 * @returns either the `<string>` or `<string>@<otherLanguage>` if the preferred language translation doesn't exist
 */
const getLocalizedString = (
    stringAndLang: readonly [null, null] | readonly [string, string] | readonly [string, null]
) => {
    if (stringAndLang[0] == null && stringAndLang[1] == null) {
        return null;
    } else if (stringAndLang[1] != null) {
        return stringAndLang[0] + "@" + stringAndLang[1];
    } else {
        // [string, null]
        return stringAndLang[0];
    }
};

/**
 * Creates a localized string from `ls`
 * @param ls
 * @param preferredLanguage
 * @returns either the `<string>` or `<string>@<otherLanguage>` if the `preferredLanguage` translation doesn't exist
 */
export const getLocalizedStringFromLanguageString = (ls: LanguageString | null, preferredLanguage: string = "en") => {
    return getLocalizedString(getStringFromLanguageStringInLang(ls, preferredLanguage));
};

const getLanguageHierarchy = (lang: string) => {
    switch (lang) {
        case "en":
            return ["cs", "de", "es", "ja"];
        case "cs":
            return ["sk", "en", "de", "es"];
        case "es":
            return ["en", "de", "cs", "sk", "ja"];
        default:
            return ["en", "es", "de", "cs", "sk"];
    }
};

export const getLanguagesForNamedThing = (
    thing:
        | null
        | SemanticModelClass
        | SemanticModelRelationship
        | SemanticModelClassUsage
        | SemanticModelRelationshipUsage
        | SemanticModelGeneralization
) => {
    const nameLs = getNameLanguageString(thing) ?? {};
    const descriptionLs = getDescriptionLanguageString(thing) ?? {};
    const usageNoteLs = getUsageNoteLanguageString(thing) ?? {};

    const langs = new Set([...Object.keys(nameLs), ...Object.keys(descriptionLs), ...Object.keys(usageNoteLs)]);
    return [...langs];
};

export const getAvailableLanguagesForLanguageString = (ls: LanguageString) => {
    return Object.keys(ls);
};

export const areLanguageStringsEqual = (ls1: LanguageString | null, ls2: LanguageString | null) => {
    if (!ls1 && !ls2) {
        return true;
    }
    if (!ls1) {
        return false;
    }
    if (!ls2) {
        return false;
    }

    if (Object.keys(ls1).length != Object.keys(ls2).length) {
        return false;
    }

    for (const [k, v] of Object.entries(ls1)) {
        if (ls2[k] != v) {
            return false;
        }
    }
    return true;
};
