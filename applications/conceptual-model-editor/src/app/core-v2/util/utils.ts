import { NamedThing, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { getRandomNumberInRange } from "../../utils/random-gen";
import { LanguageString } from "@dataspecer/core/core";
import { DCTERMS_MODEL_ID, LOCAL_MODEL_ID, SGOV_MODEL_ID, UNKNOWN_MODEL_ID } from "./constants";

export const getNameOf = (namedThing: NamedThing) => {
    const key = Object.keys(namedThing.name).at(0);
    if (key) {
        return { t: namedThing.name[key]!, l: key };
    } else {
        console.log("get-name-of: no name found", namedThing);
        return null;
    }
};
export const getDescriptionOf = (namedThing: NamedThing) => {
    const key = Object.keys(namedThing.description).at(0);
    return key ? { t: namedThing.description[key]!, l: key } : { t: "no-description", l: "unk" };
};
export const getOneNameFromLanguageString = (ls: LanguageString) => {
    const key = Object.keys(ls).at(0);
    if (key) {
        return { t: ls[key]!, l: key };
    } else {
        console.log("get-one-name-from-ls: no name found", ls);
        return null;
    }
};

export const isOwlThing = (classId: string) => classId == "http://www.w3.org/2002/07/owl#Thing"; // FIXME: do this properly

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

// --- coloring --- --- ---
export const colorForModel = new Map([
    [LOCAL_MODEL_ID, "bg-orange-300"],
    [SGOV_MODEL_ID, "bg-emerald-300"],
    [DCTERMS_MODEL_ID, "bg-rose-300"],
    [UNKNOWN_MODEL_ID, "bg-red-600"],
]); // FIXME: udelej poradne

// --- react flow --- --- ---

export const getRandomPosition = () => {
    return { x: getRandomNumberInRange(0, 800), y: getRandomNumberInRange(0, 1200) };
};
