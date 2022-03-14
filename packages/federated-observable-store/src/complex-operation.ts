import {CoreOperation, CoreResourceReader} from "@model-driven-data/core/core";
import {FederatedCoreResourceWriter} from "./federated-core-resource-writer";

/**
 * Associates multiple {@link CoreOperation} into one component operation.
 */
export interface ComplexOperation {
    execute(store: CoreResourceReader & FederatedCoreResourceWriter): Promise<void>;
}
