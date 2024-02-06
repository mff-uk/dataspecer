import { NamedThing } from "@dataspecer/core-v2/semantic-model/concepts";

export const getNameOfThingInLang = (thing: NamedThing, lang: string = "en") => {
    const name = thing.name[lang];
    if (name) {
        return [name, lang, "original"] as const;
    }

    let nextLanguages = nextLanguageInHierarchy(lang);
    while (nextLanguages.length > 0) {
        const nextLang = nextLanguages.at(0)!;
        nextLanguages = nextLanguages.slice(1);
        const possibleName = thing.name[nextLang];
        if (possibleName) {
            return [possibleName, nextLang, "fallback"] as const;
        }
        nextLanguages.push(...nextLanguageInHierarchy(nextLang));
    }
    return [null, null, null] as const;
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
