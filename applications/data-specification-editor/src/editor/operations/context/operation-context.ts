import { removeDiacritics } from "../../utils/remove-diacritics";
import { selectLanguage } from "../../utils/select-language";
import {TechnicalLabelOperationContext} from "./technical-label-operation-context";
import { LanguageString } from '@dataspecer/core/core/core-resource';

export const CASINGS = ["camelCase", "PascalCase", "kebab-case", "snake_case"] as const;

/**
 * Operation context provides helper functionality for {@link ComplexOperation}
 * that depends on user preferences or language. Example may be label
 * generation, preferred style of naming etc.
 */
export class OperationContext implements TechnicalLabelOperationContext {
    public labelRules: {
        languages: string[],
        namingConvention: typeof CASINGS[number],
        specialCharacters: "allow-all" | "allow" | "remove-diacritics" | "remove-all",
    } | null = null;

    /**
     * Returns technical label (string, that may have replaced spaces, removed
     * special characters, etc.) based on naming of PimResource.
     * @param pimResource
     */
    public getTechnicalLabelFromPim(name: LanguageString): string | null {
        if (this.labelRules === null) return null;

        let text = selectLanguage(name ?? {}, this.labelRules.languages);

        if (text === undefined || text === null) return null;

        switch (this.labelRules.specialCharacters) {
            case "allow":
                // remove only problematic characters
                text = text.replace(/["\\\/]/g, " "); // space-like
                break;
            case "remove-all":
                text = removeDiacritics(text);
                text = text.replace(/["\\\/]/g, " "); // space-like
                text = text.replace(/[^a-zA-Z0-9-_\s]/g, "");
                break;
            case "remove-diacritics":
                text = removeDiacritics(text);
        }

        const lowercaseWords = text.replace(/\s+/g, " ").split(" ").map(w => w.toLowerCase());

        switch (this.labelRules.namingConvention) {
            case "snake_case": text = lowercaseWords.join("_"); break
            case "kebab-case": text = lowercaseWords.join("-"); break
            case "camelCase": text = lowercaseWords.map((w, index) => index > 0 ? w[0].toUpperCase() + w.substring(1) : w).join(""); break
            case "PascalCase": text = lowercaseWords.map(w => w[0].toUpperCase() + w.substring(1)).join(""); break
        }

        return text;
    }
}
