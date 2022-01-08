import {OperationExecutor} from "./operation-executor";
import {CoreOperation} from "@model-driven-data/core//core";

/**
 * Operation that consists of multiple model-driven-data {@link CoreOperation} that can be executed across multiple
 * stores.
 */
export interface ComplexOperation {
    execute(executor: OperationExecutor): Promise<void>;
}
