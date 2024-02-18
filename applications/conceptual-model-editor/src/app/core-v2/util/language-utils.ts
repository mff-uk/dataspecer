import { LanguageString, NamedThing } from "@dataspecer/core-v2/semantic-model/concepts";

export const getNameOfThingInLangOrIri = (thing: NamedThing, iri: string, lang: string = "en") => {
    const [name, fallbackNameLang] = getFieldOfNamedThingInLang("name", thing, lang);

    if (!name && !fallbackNameLang) {
        return [iri, null] as const;
    } else {
        return [name, fallbackNameLang] as const;
    }
};

export const getNameOfThingInLang = (thing: NamedThing, lang: string = "en") => {
    return getFieldOfNamedThingInLang("name", thing, lang);
};

export const getDescriptionOfThingInLang = (thing: NamedThing, lang: string = "en") => {
    return getFieldOfNamedThingInLang("description", thing, lang);
};

const getFieldOfNamedThingInLang = (field: "name" | "description", thing: NamedThing, lang: string = "en") => {
    const result = thing[field]?.[lang];
    if (result) {
        return [result, null] as const;
    }

    let nextLanguages = nextLanguageInHierarchy(lang);
    while (nextLanguages.length > 0) {
        const nextLang = nextLanguages.at(0)!;
        nextLanguages = nextLanguages.slice(1);
        const possibleResult = thing[field]?.[nextLang];
        if (possibleResult) {
            return [possibleResult, nextLang] as const;
        }
        nextLanguages.push(...nextLanguageInHierarchy(nextLang));
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

export const getLanguagesForNamedThing = (thing: NamedThing) => {
    const langs = new Set<string>(Object.keys(thing.name));
    Object.keys(thing.description).forEach((lang) => langs.add(lang));
    return [...langs];
};

export const getAvailableLanguagesForLanguageString = (ls: LanguageString) => {
    const languages = Object.keys(ls);
    return languages;
};
