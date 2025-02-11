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
import { SemanticModelClassProfile, SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";

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

  // Get lang from lang hierarchy
  const nextLanguages = getLanguageHierarchy(preferredLanguage);
  for (const language of nextLanguages) {
    const possibleResult = languageString?.[language];
    if (possibleResult) {
      return [possibleResult, language] as const;
    }
  }

  // Get any lang
  const languages = getAvailableLanguagesForLanguageString(languageString);
  const anyLanguage = languages.at(0);
  if (anyLanguage) {
    const value = languageString[anyLanguage]!;
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
  if (stringAndLang[0] === null && stringAndLang[1] === null) {
    return null;
  } else if (stringAndLang[1] !== null) {
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

const getLanguageHierarchy = (language: string) => {
  switch (language) {
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
        | SemanticModelClassProfile
        | SemanticModelRelationshipProfile
) => {
  const nameLs = getNameLanguageString(thing) ?? {};
  const descriptionLs = getDescriptionLanguageString(thing) ?? {};
  const usageNoteLs = getUsageNoteLanguageString(thing) ?? {};

  const langs = new Set([...Object.keys(nameLs), ...Object.keys(descriptionLs), ...Object.keys(usageNoteLs)]);
  return [...langs];
};

export const getAvailableLanguagesForLanguageString = (value: LanguageString) => {
  return Object.keys(value);
};

export const areLanguageStringsEqual = (left: LanguageString | null, right: LanguageString | null) => {
  if (!left && !right) {
    return true;
  }
  if (!left) {
    return false;
  }
  if (!right) {
    return false;
  }

  if (Object.keys(left).length !== Object.keys(right).length) {
    return false;
  }

  for (const [k, v] of Object.entries(left)) {
    if (right[k] !== v) {
      return false;
    }
  }
  return true;
};
