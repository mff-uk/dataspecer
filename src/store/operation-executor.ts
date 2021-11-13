import {CoreOperation, CoreOperationResult, CoreResourceReader} from "model-driven-data/core";
import {_CoreResourceReader_WithMissingMethods} from "./federated-observable-store";

export interface StoreDescriptor {
    type: string;
}

export class StoreHavingResourceDescriptor implements StoreDescriptor {
    type = "StoreHavingResourceDescriptor";
    resource: string;

    constructor(resource: string) {
        this.resource = resource;
    }

    static is(descriptor: StoreDescriptor): descriptor is StoreHavingResourceDescriptor {
        return descriptor.type === "StoreHavingResourceDescriptor";
    }
}

export class StoreByPropertyDescriptor implements StoreDescriptor {
    type = "StoreByPropertyDescriptor";
    property: string;

    constructor(property: string) {
        this.property = property;
    }

    static is(descriptor: StoreDescriptor): descriptor is StoreByPropertyDescriptor {
        return descriptor.type === "StoreByPropertyDescriptor";
    }
}

/**
 * This class is passed to {@link ComplexOperation} as an executor for operations. One {@link CoreResourceReader} is
 * provided as the only way how operation can read resources before modifying them. Modifications are performed
 * by calling applyOperation method where the correct store must be specified.
 */
export interface OperationExecutor {
    store: _CoreResourceReader_WithMissingMethods;
    applyOperation(operation: CoreOperation, store: StoreDescriptor): Promise<CoreOperationResult>;
}
