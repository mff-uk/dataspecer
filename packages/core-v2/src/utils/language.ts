import { LanguageString } from '../semantic-model/concepts/concepts.ts';

export function getTranslation(languageString: LanguageString | null | undefined | false, langs: string[]): {
  ok: true;
  translation: string;
  isPrimaryLanguage: boolean;
  language: string;
} | {
  ok: false;
  translation: "";
} {
  if (languageString) {
    for (const lang of langs) {
      if (languageString?.[lang]) {
        return {
          ok: true,
          translation: languageString[lang]!,
          isPrimaryLanguage: lang === langs[0],
          language: lang,
        };
      }
    }

    for (const language in languageString) {
      return {
        ok: true,
        translation: languageString[language]!,
        isPrimaryLanguage: language === langs[0],
        language,
      };
    }
  }

  return {
    ok: false,
    translation: "",
  };
}