import { SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { LanguageString } from "@dataspecer/core/core";

export const getOneNameFromLanguageString = (ls: LanguageString) => {
    const key = Object.keys(ls).at(0);
    if (key) {
        return { t: ls[key]!, l: key };
    } else {
        console.log("get-one-name-from-ls: no name found", ls);
        return null;
    }
};

export const isAttribute = (relationship: SemanticModelRelationship) => {
    return (
        (relationship.ends[1] && relationship.ends[1]?.concept == null) ||
        (relationship.ends[1] && relationship.ends[1].concept == "") // FIXME: tadyto se deje, protoze neumim vytvorit atribut, ktery by mel jako concept null
    );
};

export const shortenStringTo = (modelId: string | null, length: number = 20) => {
    if (!modelId) {
        return modelId;
    }
    const modelName = modelId.length > length ? `...${modelId.substring(modelId.length - (length - 3))}` : modelId;
    return modelName;
};

// --- dialogs --- --- ---

export const clickedInside = (rect: DOMRect, cliX: number, cliY: number) => {
    const offset = 15;
    return (
        rect.top + offset <= cliY &&
        cliY <= rect.top + rect.height + offset &&
        rect.left - offset <= cliX &&
        cliX <= rect.left + rect.width + offset
    );
};
