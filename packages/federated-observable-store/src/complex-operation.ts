import {CoreOperation} from "@dataspecer/core/core";
import {FederatedObservableStore} from "./federated-observable-store";

/**
 * Associates multiple {@link CoreOperation} into one component operation.
 */
export interface ComplexOperation {
    setStore(store: FederatedObservableStore): void;
    execute(): Promise<void>;
}
