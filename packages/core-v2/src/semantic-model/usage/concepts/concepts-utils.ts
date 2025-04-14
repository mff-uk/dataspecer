import { Entity } from "../../../entity-model/index.ts";
import { SemanticModelRelationship, isSemanticModelRelationPrimitive } from "../../concepts/index.ts";
import { SemanticModelClassUsage, SemanticModelRelationshipUsage } from "./concepts.ts";

/**
 * @deprecated
 */
export const SEMANTIC_MODEL_RELATIONSHIP_USAGE = "relationship-usage";

/**
 * @deprecated
 */
export const SEMANTIC_MODEL_CLASS_USAGE = "class-usage";

/**
 * @deprecated
 */
export function isSemanticModelRelationshipUsage(resource: Entity | null): resource is SemanticModelRelationshipUsage {
    return resource?.type?.includes(SEMANTIC_MODEL_RELATIONSHIP_USAGE) ?? false;
}

/**
 * @deprecated
 */
export function isSemanticModelClassUsage(resource: Entity | null): resource is SemanticModelClassUsage {
    return resource?.type?.includes(SEMANTIC_MODEL_CLASS_USAGE) ?? false;
}

/**
 * @deprecated
 */
export function isSemanticModelAttributeUsage(resource: Entity | null): resource is SemanticModelRelationshipUsage {
    if (!isSemanticModelRelationshipUsage(resource)) {
        return false;
    }
    return isSemanticModelRelationPrimitive(resource as SemanticModelRelationship & SemanticModelRelationshipUsage);
}
