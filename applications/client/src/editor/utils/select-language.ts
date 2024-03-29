import {LanguageString} from "@dataspecer/core/core";

export function selectLanguage(input: LanguageString, languages: readonly string[]): string | undefined {
    for (const language of languages) {
        if (input[language]) {
            return input[language];
        }
    }

    // noinspection LoopStatementThatDoesntLoopJS
    for (const language in input) {
        return input[language];
    }

    return undefined;
}
