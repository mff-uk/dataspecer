import { NamedThing, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { getRandomNumberInRange } from "../../utils/random-gen";
import { LanguageString } from "@dataspecer/core/core";
import { DCTERMS_MODEL_ID, LOCAL_MODEL_ID, SGOV_MODEL_ID, UNKNOWN_MODEL_ID } from "./constants";

export const getNameOf = (namedThing: NamedThing) => {
    const key = Object.keys(namedThing.name).at(0);
    return key ? { t: namedThing.name[key]!, l: key } : { t: "no-name", l: "unk" };
};
export const getDescriptionOf = (namedThing: NamedThing) => {
    const key = Object.keys(namedThing.description).at(0);
    return key ? { t: namedThing.description[key]!, l: key } : { t: "no-description", l: "unk" };
};
export const getOneNameFromLanguageString = (ls: LanguageString) => {
    const key = Object.keys(ls).at(0);
    return key ? { t: ls[key], l: key } : { t: "no-name", l: "unk" };
};

export const isOwlThing = (classId: string) => classId == "http://www.w3.org/2002/07/owl#Thing"; // FIXME: do this properly

export const isAttribute = (relationship: SemanticModelRelationship) => {
    console.log("utils: is-attribute", relationship);
    return (
        (relationship.ends[1] && relationship.ends[1]?.concept == null) ||
        (relationship.ends[1] && relationship.ends[1].concept == "") // FIXME: tadyto se deje, protoze neumim vytvorit atribut, ktery by mel jako concept null
    );
};

// --- coloring --- --- ---
export const colorForModel = new Map([
    [LOCAL_MODEL_ID, "bg-orange-300"],
    [SGOV_MODEL_ID, "bg-emerald-300"],
    [DCTERMS_MODEL_ID, "bg-rose-300"],
    [UNKNOWN_MODEL_ID, "bg-red-600"],
]); // FIXME: udelej poradne

export const tailwindColorToHex = new Map([
    ["bg-orange-300", "#fdba74"],
    ["bg-emerald-300", "#6ee7b7"],
    ["bg-rose-300", "#fda4af"],
    ["bg-red-600", "#dc2626"],
]);

// --- react flow --- --- ---

export const getRandomPosition = () => {
    return { x: getRandomNumberInRange(0, 800), y: getRandomNumberInRange(0, 1200) };
};
