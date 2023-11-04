import { NamedThing } from "node_modules/@dataspecer/core-v2/lib/semantic-model/concepts/concepts";
import {
    SemanticModelRelationship,
    SemanticModelClass,
    SemanticModelGeneralization,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { Edge, MarkerType, Node } from "reactflow";
import { useClassesContext } from "./classes-context";
import { useModelGraphContext } from "./graph-context";
import { getRandomNumberInRange } from "../utils/random-gen";
import { LanguageString } from "@dataspecer/core/core";

export const getNameOf = (namedThing: NamedThing) => {
    const key = Object.keys(namedThing.name).at(0);
    return key ? `${namedThing.name[key]}@${key}` : "no-name";
};
export const getDescriptionOf = (namedThing: NamedThing) => {
    const key = Object.keys(namedThing.description).at(0);
    return key ? `${namedThing.description[key]}@${key}` : "no-description";
};
export const getOneNameFromLanguageString = (ls: LanguageString) => {
    const key = Object.keys(ls).at(0);
    return key ? `${ls[key]}@${key}` : "no-name";
};

export const isOwlThing = (classId: string) => classId == "http://www.w3.org/2002/07/owl#Thing"; // FIXME: do this properly

// --- coloring --- --- ---
export const colorForModel = new Map([
    ["local", "bg-orange-300"],
    ["sgov", "bg-emerald-300"],
    ["dcterms", "bg-rose-300"],
]); // FIXME: udelej poradne

export const tailwindColorToHex = new Map([
    ["bg-orange-300", "#fdba74"],
    ["bg-emerald-300", "#6ee7b7"],
    ["bg-rose-300", "#fda4af"],
]);

// --- react flow --- --- ---

export const getRandomPosition = () => {
    return { x: getRandomNumberInRange(0, 800), y: getRandomNumberInRange(0, 1200) };
};

export const semanticModelClassToReactFlowNode = (
    cls: SemanticModelClass,
    position: { x: number; y: number } | undefined,
    tailwindColor: string | undefined // FIXME: vymysli lip
) =>
    ({
        id: cls.id,
        position: position ?? { x: 69, y: 420 },
        data: { cls, tailwindColor /*FIXME: */ },
        type: "classCustomNode",
    } as Node);

export const semanticModelRelationshipToReactFlowEdge = (rel: SemanticModelRelationship, index: number = 6.9) =>
    ({
        id: rel.id,
        source: rel.ends[0]!.concept,
        target: rel.ends[1]!.concept,
        markerEnd: MarkerType.Arrow,
        type: "floating",
        data: { label: getNameOf(rel) },
    } as Edge);

export const semanticModelGeneralizationToReactFlowEdge = (gen: SemanticModelGeneralization, index: number = 6.9) =>
    ({
        id: gen.id,
        source: gen.child,
        target: gen.parent,
        markerEnd: MarkerType.ArrowClosed,
        type: "straight",
        data: { label: "generalization" },
        style: { color: "maroon" },
    } as Edge);
