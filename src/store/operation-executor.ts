import {CoreOperation, CoreOperationResult} from "model-driven-data/core";

export interface OperationExecutor {
    changed: Set<string>;
    deleted: Set<string>;
    applyOperation(operation: CoreOperation, forResource: string): Promise<CoreOperationResult>;
}
