import {Entity} from "../../entity-model/entity";

/**
 * A human text that is translated into multiple languages.
 *
 * Keys are ISO 639-1 language codes.
 */
export type LanguageString = { [key: string]: string };

export interface NamedThing {
    name: LanguageString;
    //alias: LanguageString[];
    description: LanguageString;
}

/**
 * Represent classes, enumerations and simple data types.
 */
export interface SemanticModelClass extends NamedThing, Entity {
    type: [typeof SEMANTIC_MODEL_CLASS];

    // todo: is it class, enumeration, datatype, code list, ...
}

export const SEMANTIC_MODEL_CLASS = "class"; // todo use proper IRI

export function isSemanticModelClass(resource: Entity | null): resource is SemanticModelClass {
    return resource?.type.includes(SEMANTIC_MODEL_CLASS) ?? false;
}

/**
 * Represents attributes and associations.
 */
export interface SemanticModelRelationship extends NamedThing, Entity {
    type: [typeof SEMANTIC_MODEL_RELATIONSHIP];

    ends: SemanticModelRelationshipEnd[]

    // todo: is it attribute or association
}

export interface SemanticModelRelationshipEnd extends NamedThing {
    cardinality?: [number, number|null];

    /** {@link SemanticModelClass} */
    concept: string;
}

export const SEMANTIC_MODEL_RELATIONSHIP = "relationship"; // todo use proper IRI

export function isSemanticModelRelationship(resource: Entity | null): resource is SemanticModelRelationship {
    return resource?.type.includes(SEMANTIC_MODEL_RELATIONSHIP) ?? false;
}

/**
 * Inheritance hierarchy.
 */
export interface SemanticModelGeneralization extends Entity {
    type: [typeof SEMANTIC_MODEL_GENERALIZATION]

    /** {@link SemanticModelClass} */
    child: string;

    /** {@link SemanticModelClass} */
    parent: string;
}

export const SEMANTIC_MODEL_GENERALIZATION = "generalization"; // todo use proper IRI

export function isSemanticModelGeneralization(resource: Entity | null): resource is SemanticModelGeneralization {
    return resource?.type.includes(SEMANTIC_MODEL_GENERALIZATION) ?? false;
}