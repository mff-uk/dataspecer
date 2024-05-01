import {
    LanguageString,
    SemanticModelClass,
    SemanticModelGeneralization,
    SemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { getDescriptionLanguageString, getNameLanguageString, getUsageNoteLanguageString } from "./name-utils";

export const getStringFromLanguageStringInLang = (languageString: LanguageString | null, lang: string = "en") => {
    if (!languageString) {
        return [null, null] as const;
    }

    const result = languageString?.[lang];
    if (result) {
        return [result, null] as const;
    }

    // get lang from lang hierarchy
    let nextLanguages = nextLanguageInHierarchy(lang);
    while (nextLanguages.length > 0) {
        const nextLang = nextLanguages.at(0)!;
        nextLanguages = nextLanguages.slice(1);
        const possibleResult = languageString?.[nextLang];
        if (possibleResult) {
            return [possibleResult, nextLang] as const;
        }
        nextLanguages.push(...nextLanguageInHierarchy(nextLang));
    }

    // get any lang
    const languages = getAvailableLanguagesForLanguageString(languageString);
    if (languages.length > 0) {
        const l = languages.at(0)!;
        const res = languageString?.[l]!;
        return [res, l] as const;
    }

    return [null, null] as const;
};

export const getLocalizedString = (
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

export const getLocalizedStringFromLanguageString = (ls: LanguageString | null, lang: string = "en") => {
    return getLocalizedString(getStringFromLanguageStringInLang(ls, lang));
};

const nextLanguageInHierarchy = (lang: string) => {
    switch (lang) {
        case "en":
            return ["cs", "es"];
        case "cs":
            return ["sk", "de"];
        case "es":
            return ["de"];
        default:
            return [];
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
    const languages = Object.keys(ls);
    return languages;
};
