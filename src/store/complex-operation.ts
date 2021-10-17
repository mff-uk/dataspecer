import {OperationExecutor, StoreDescriptor} from "./operation-executor";
import {CoreOperation, CoreOperationResult} from "model-driven-data/core";

/**
 * Operation that consists of multiple model-driven-data {@link CoreOperation} that can be executed across multiple
 * stores.
 */
export interface ComplexOperation {
    execute(executor: OperationExecutor): Promise<void>;
}

/**
 * Wrapper for model-driven-data {@link CoreOperation} as more universal {@link ComplexOperation}.
 */
export class ComplexOperationFromCoreOperation implements ComplexOperation {
    public operationResult: CoreOperationResult | null = null;
    private readonly operation: CoreOperation;
    private readonly storeDescriptor: StoreDescriptor;

    constructor(operation: CoreOperation, storeDescriptor: StoreDescriptor) {
        this.operation = operation;
        this.storeDescriptor = storeDescriptor;
    }

    async execute(executor: OperationExecutor): Promise<void> {
        this.operationResult = await executor.applyOperation(this.operation, this.storeDescriptor);
    }
}
