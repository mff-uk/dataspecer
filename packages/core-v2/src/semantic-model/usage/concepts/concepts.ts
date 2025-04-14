import { Entity } from "../../../entity-model/index.ts";
import { LanguageString, NamedThing } from "../../concepts/concepts.ts";
import { SEMANTIC_MODEL_CLASS_USAGE, SEMANTIC_MODEL_RELATIONSHIP_USAGE } from "./concepts-utils.ts";

/**
 * @deprecated Will be removed with profiles.
 */
export type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};

interface WithUsageNote {
    /**
     * Additional information about the usage of the entity.
     * If null, the usage is not described.
     */
    usageNote: LanguageString | null;
}

/**
 * Usage semantically works as a subentity (subclass, subproperty), but is treated differently. Its public IRI is the
 * same as IRI of entity that is being used. Moreover, it should "shadow" the entity that is being used, because in the
 * given context this is more appropriate description of the entity. Each entity may have multiple usages.
 *
 * @deprecated Use profiles instead.
 */
export interface SemanticModelUsage extends Entity, WithUsageNote {
    /**
     * ID of the entity that is being used. Usage has same IRI as the entity that is being used.
     */
    usageOf: string;

    /**
     * Public, usually globally-recognized, identifier of the entity.
     * The value may be null indicating that the entity has no public IRI.
     * @example http://xmlns.com/foaf/0.1/Person
     *
     * IRI may be relative to the base IRI of the model.
     */
    iri: string | null;
}

/**
 * @deprecated Use profiles instead.
 */
export interface SemanticModelRelationshipUsage extends SemanticModelUsage, Nullable<NamedThing> {
    type: [typeof SEMANTIC_MODEL_RELATIONSHIP_USAGE];

    ends: SemanticModelRelationshipEndUsage[];
}

/**
 * @deprecated Use profiles instead.
 */
export interface SemanticModelRelationshipEndUsage extends Nullable<NamedThing>, WithUsageNote {
    /**
     * Must be stricter or equal to the corresponding cardinality of the used entity.
     * If null, the cardinality is not changed.
     */
    cardinality: [number, number | null] | null;

    /**
     * Must be descendant or self of the corresponding concept of the used entity.
     * If null, the concept is not changed.
     */
    concept: string | null;

    /**
     * Public, usually globally-recognized, identifier of the entity.
     * The value may be null indicating that the entity has no public IRI.
     * @example http://xmlns.com/foaf/0.1/Person
     *
     * IRI may be relative to the base IRI of the model.
     */
    iri: string | null;
}

/**
 * @deprecated Use profiles instead.
 */
export interface SemanticModelClassUsage extends SemanticModelUsage, Nullable<NamedThing> {
    type: [typeof SEMANTIC_MODEL_CLASS_USAGE];
}
