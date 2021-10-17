import {CoreOperation, CoreOperationResult} from "model-driven-data/core";
import {ObservableCoreResourceReaderWriter} from "./observable-core-resource-reader-writer";

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

export interface OperationExecutor {
    changed: Set<string>;
    deleted: Set<string>;
    store: ObservableCoreResourceReaderWriter;

    applyOperation(operation: CoreOperation, store: StoreDescriptor): Promise<CoreOperationResult>;
}
