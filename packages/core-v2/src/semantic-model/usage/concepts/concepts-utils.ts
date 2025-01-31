import { Entity } from "../../../entity-model";
import { SemanticModelRelationship, isSemanticModelAttribute, isSemanticModelRelationPrimitive } from "../../concepts";
import { SemanticModelClassUsage, SemanticModelRelationshipUsage } from "./concepts";

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
    return resource?.type.includes(SEMANTIC_MODEL_RELATIONSHIP_USAGE) ?? false;
}

/**
 * @deprecated
 */
export function isSemanticModelClassUsage(resource: Entity | null): resource is SemanticModelClassUsage {
    return resource?.type.includes(SEMANTIC_MODEL_CLASS_USAGE) ?? false;
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
