/**
 * A human text that is translated into multiple languages.
 *
 * Keys are ISO 639-1 language codes.
 */
export type LanguageString = { [key: string]: string };

export interface NamedThing {
    name?: LanguageString;
    alias?: LanguageString;
    description?: LanguageString;
}