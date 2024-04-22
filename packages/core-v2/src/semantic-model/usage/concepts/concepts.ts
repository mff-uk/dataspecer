import { Entity } from "../../../entity-model";
import { LanguageString, NamedThing } from "../../concepts/concepts";
import { SEMANTIC_MODEL_CLASS_USAGE, SEMANTIC_MODEL_RELATIONSHIP_USAGE } from "./concepts-utils";

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
 */
export interface SemanticModelUsage extends Entity, WithUsageNote {
    /**
     * ID of the entity that is being used. Usage has same IRI as the entity that is being used.
     */
    usageOf: string;
}

export interface SemanticModelRelationshipUsage extends SemanticModelUsage, Nullable<NamedThing> {
    type: [typeof SEMANTIC_MODEL_RELATIONSHIP_USAGE];

    ends: SemanticModelRelationshipEndUsage[];
}

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
}

export interface SemanticModelClassUsage extends SemanticModelUsage, Nullable<NamedThing> {
    type: [typeof SEMANTIC_MODEL_CLASS_USAGE];
}
