import {Entity} from "../../entity-model";
import {SemanticModelClass, SemanticModelGeneralization, SemanticModelRelationship} from "./concepts";

export const SEMANTIC_MODEL_CLASS = "class"; // todo use proper IRI
export function isSemanticModelClass(resource: Entity | null): resource is SemanticModelClass {
    return resource?.type.includes(SEMANTIC_MODEL_CLASS) ?? false;
}

export const SEMANTIC_MODEL_RELATIONSHIP = "relationship"; // todo use proper IRI
export function isSemanticModelRelationship(resource: Entity | null): resource is SemanticModelRelationship {
    return resource?.type.includes(SEMANTIC_MODEL_RELATIONSHIP) ?? false;
}

export const SEMANTIC_MODEL_GENERALIZATION = "generalization"; // todo use proper IRI
export function isSemanticModelGeneralization(resource: Entity | null): resource is SemanticModelGeneralization {
    return resource?.type.includes(SEMANTIC_MODEL_GENERALIZATION) ?? false;
}