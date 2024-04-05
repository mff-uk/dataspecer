import { LanguageString, NamedThing } from "@dataspecer/core-v2/semantic-model/concepts";
import { shortenStringTo } from "./utils";
import { SemanticModelUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

export const getNameOrIriAndDescription = (thing: NamedThing | undefined | null, iri: string, lang: string = "en") => {
    if (!thing) {
        return [null, null] as const;
    }

    const [name, fallbackLang] = getStringFromLanguageStringInLang(thing.name, lang);
    const [description, fallbackDescriptionLang] = getStringFromLanguageStringInLang(thing.description, lang);

    let displayName: string;
    if (name && !fallbackLang) {
        displayName = name;
    } else if (name && fallbackLang) {
        displayName = `${name}@${fallbackLang}`;
    } else {
        displayName = shortenStringTo(iri, 30) || "no-name";
    }

    let descr = "";

    if (description && !fallbackDescriptionLang) {
        descr = description;
    } else if (description && fallbackDescriptionLang) {
        descr = `${description}@${fallbackDescriptionLang}`;
    }
    return [displayName, descr] as const;
};

export const getNameOfThingInLangOrIri = (thing: NamedThing, iri: string, lang: string = "en") => {
    const [name, fallbackNameLang] = getStringFromLanguageStringInLang("name", thing, lang);

    if (!name && !fallbackNameLang) {
        return [iri, null] as const;
    } else {
        return [name, fallbackNameLang] as const;
    }
};

export const getUsageNote = (thing: SemanticModelUsage, lang: string = "en") => {
    if (!thing.usageNote) {
        return null;
    }
    const [note, fallbackLang] = getStringFromLanguageStringInLang(thing.usageNote, lang);
    if (note && !fallbackLang) {
        return note;
    } else if (note && fallbackLang) {
        return `${note}@${fallbackLang}`;
    } else {
        return null;
    }
};

export const getStringFromLanguageStringInLang = (languageString: LanguageString, lang: string = "en") => {
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

// TODO: export from concepts
type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};

export const getLanguagesForNamedThing = (thing: Nullable<NamedThing>) => {
    const langs = new Set<string>(Object.keys(thing?.name ?? {}));
    Object.keys(thing?.description ?? {}).forEach((lang) => langs.add(lang));
    return [...langs];
};

export const getAvailableLanguagesForLanguageString = (ls: LanguageString) => {
    const languages = Object.keys(ls);
    return languages;
};
