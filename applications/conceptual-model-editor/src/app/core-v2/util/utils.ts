import { EntityModel } from "@dataspecer/core-v2/entity-model";
import { SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { LanguageString } from "@dataspecer/core/core";
import { InMemorySemanticModel } from "../../../../../../packages/core-v2/lib/semantic-model/in-memory/in-memory-semantic-model";
import { SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

export const getOneNameFromLanguageString = (ls: LanguageString) => {
    const key = Object.keys(ls).at(0);
    if (key) {
        return { t: ls[key]!, l: key };
    } else {
        console.log("get-one-name-from-ls: no name found", ls);
        return null;
    }
};

export const isAttribute = (relationship: SemanticModelRelationship | SemanticModelRelationshipUsage) => {
    return (
        (relationship.ends[1] && relationship.ends[1].concept == null) ||
        (relationship.ends[1] && relationship.ends[1].concept == "") // FIXME: tadyto se deje, protoze neumim vytvorit atribut, ktery by mel jako concept null
    );
};
export const filterInMemoryModels = (models: EntityModel[]) => {
    return models.filter((m): m is InMemorySemanticModel => m instanceof InMemorySemanticModel);
};
export const shortenStringTo = (modelId: string | null, length: number = 20) => {
    if (!modelId) {
        return modelId;
    }
    const modelName = modelId.length > length ? `...${modelId.substring(modelId.length - (length - 3))}` : modelId;
    return modelName;
};

export const cardinalityToString = (cardinality: [number, number | null] | undefined | null) => {
    if (!cardinality) {
        return undefined;
    }
    return `[${cardinality[0] || "*"}..${cardinality[1] || "*"}]`;
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
