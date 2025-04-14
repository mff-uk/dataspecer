import {Operation} from "../../operations/index.ts";
import {SemanticModelClassUsage, SemanticModelRelationshipUsage} from "../concepts/index.ts";

export interface CreateClassUsageOperation extends Operation {
    type: typeof CREATE_CLASS_USAGE_OPERATION;
    entity: Partial<Omit<SemanticModelClassUsage, "type">> & Pick<SemanticModelClassUsage, "usageOf">;
}

export interface ModifyClassUsageOperation extends Operation {
    type: typeof MODIFY_CLASS_USAGE_OPERATION;
    id: string;
    entity: Partial<Omit<SemanticModelClassUsage, "type" | "usageOf">>;
}

export interface CreateRelationshipUsageOperation extends Operation {
    type: typeof CREATE_RELATIONSHIP_USAGE_OPERATION;
    entity: Partial<Omit<SemanticModelRelationshipUsage, "type">> & Pick<SemanticModelRelationshipUsage, "usageOf">;
}

export interface ModifyRelationshipUsageOperation extends Operation {
    type: typeof MODIFY_RELATIONSHIP_USAGE_OPERATION;
    id: string;
    entity: Partial<Omit<SemanticModelRelationshipUsage, "type" | "usageOf">>;
}


export const CREATE_CLASS_USAGE_OPERATION = 'create-class-usage';
export const MODIFY_CLASS_USAGE_OPERATION = 'modify-class-usage';
export const CREATE_RELATIONSHIP_USAGE_OPERATION = 'create-relation-usage';
export const MODIFY_RELATIONSHIP_USAGE_OPERATION = 'modify-relation-usage';

export function isCreateClassUsageOperation(operation: Operation): operation is CreateClassUsageOperation {
    return operation.type === CREATE_CLASS_USAGE_OPERATION;
}

export function isModifyClassUsageOperation(operation: Operation): operation is ModifyClassUsageOperation {
    return operation.type === MODIFY_CLASS_USAGE_OPERATION;
}

export function isCreateRelationshipUsageOperation(operation: Operation): operation is CreateRelationshipUsageOperation {
    return operation.type === CREATE_RELATIONSHIP_USAGE_OPERATION;
}

export function isModifyRelationshipUsageOperation(operation: Operation): operation is ModifyRelationshipUsageOperation {
    return operation.type === MODIFY_RELATIONSHIP_USAGE_OPERATION;
}

/**
 * @deprecated
 */
export function createClassUsage(entity: Partial<Omit<SemanticModelClassUsage, "type">> & Pick<SemanticModelClassUsage, "usageOf">): CreateClassUsageOperation {
    return {
        type: CREATE_CLASS_USAGE_OPERATION,
        entity
    }
}

/**
 * @deprecated
 */
export function modifyClassUsage(id: string, entity: Partial<Omit<SemanticModelClassUsage, "type" | "usageOf">>): ModifyClassUsageOperation {
    return {
        type: MODIFY_CLASS_USAGE_OPERATION,
        id,
        entity
    }
}

/**
 * @deprecated
 */
export function createRelationshipUsage(entity: Partial<Omit<SemanticModelRelationshipUsage, "type">> & Pick<SemanticModelRelationshipUsage, "usageOf">): CreateRelationshipUsageOperation {
    return {
        type: CREATE_RELATIONSHIP_USAGE_OPERATION,
        entity
    }
}

/**
 * @deprecated
 */
export function modifyRelationshipUsage(id: string, entity: Partial<Omit<SemanticModelRelationshipUsage, "type" | "usageOf">>): ModifyRelationshipUsageOperation {
    return {
        type: MODIFY_RELATIONSHIP_USAGE_OPERATION,
        id,
        entity
    }
}