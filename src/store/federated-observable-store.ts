import {CoreResourceLink} from "./core-resource-link";
import {ComplexOperation, ComplexOperationFromCoreOperation} from "./complex-operation";
import {ObservableCoreResourceReaderWriter, Subscriber} from "./observable-core-resource-reader-writer";
import {OperationExecutor} from "./operation-executor";
import {CoreOperation, CoreOperationResult} from "model-driven-data/core";

type SubscriptionType = {
    currentValue: CoreResourceLink,
    originatedStore: ObservableCoreResourceReaderWriter | null,

    storeValues: Map<ObservableCoreResourceReaderWriter, CoreResourceLink>,
    subscribers: Subscriber[],
};

class OperationExecutorForFederatedStore implements OperationExecutor {
    public changed: Set<string> = new Set<string>();
    public deleted: Set<string> = new Set<string>();
    applyOperation: (operation: CoreOperation, forResource: string) => Promise<CoreOperationResult>;

    constructor(applyOperation: (operation: CoreOperation, forResource: string) => Promise<CoreOperationResult>) {
        this.applyOperation = applyOperation;
    };
}

/**
 * Combines multiple {@link ObservableCoreResourceReaderWriter} into one with proper distribution of operations and
 * subscriptions.
 */
export class FederatedObservableCoreModelReaderWriter implements ObservableCoreResourceReaderWriter {
    private subscriptions: Map<string, SubscriptionType> = new Map();
    private stores: ObservableCoreResourceReaderWriter[] = [];

    addSubscriber(iri: string, subscriber: Subscriber) {
        if (!this.subscriptions.has(iri)) {
            this.subscriptions.set(iri, {
                currentValue: {
                    resource: null,
                    isLoading: true,
                },
                storeValues: new Map(),
                subscribers: [],
                originatedStore: null,
            });

            this.stores.forEach(store => store.addSubscriber(iri, this.subscriber));
        }

        const entry = this.subscriptions.get(iri) as SubscriptionType;

        entry.subscribers.push(subscriber);
        subscriber(iri, entry.currentValue, this);
    }

    removeSubscriber(iri: string, subscriber: Subscriber) {
        const entry = this.subscriptions.get(iri) as SubscriptionType;
        entry.subscribers = entry.subscribers.filter(s => s !== subscriber);
        if (entry.subscribers.length === 0) {
            this.stores.forEach(store => store.removeSubscriber(iri, this.subscriber));
            this.subscriptions.delete(iri);
        }
    }

    addStore(store: ObservableCoreResourceReaderWriter) {
        if (this.stores.includes(store)) {
            throw new Error("Store already presented in FederatedObservableCoreModelReaderWriter.");
        }

        this.stores.push(store);
        this.subscriptions.forEach((_,iri) => store.addSubscriber(iri, this.subscriber));
    }

    removeStore(store: ObservableCoreResourceReaderWriter) {
        if (!this.stores.includes(store)) {
            throw new Error("Unable to remove store from FederatedObservableCoreModelReaderWriter because it does not exists.");
        }

        this.stores = this.stores.filter(s => s !== store);
        this.subscriptions.forEach((entry,iri) => {
            store.removeSubscriber(iri, this.subscriber);
            entry.storeValues.delete(store);
            this.triggerChange(iri);
        });

    }

    async executeOperation(operation: ComplexOperation) {
        const executor = new OperationExecutorForFederatedStore(async (operation, forResource) => {
            const store = await this.getOriginatedStoreForResource(forResource);
            if (!store) {
                throw new Error(`Unable to execute an operation because ${forResource} has not been found in any store.`);
            }
            const complexOperationFromCoreOperation = new ComplexOperationFromCoreOperation(operation, forResource);
            await store.executeOperation(complexOperationFromCoreOperation);

            return complexOperationFromCoreOperation.operationResult as CoreOperationResult;
        });

        await operation.execute(executor);
    }

    private subscriber: Subscriber = (iri, resource, store) => {
        const entry = this.subscriptions.get(iri);
        if (!entry) {
            throw new Error("problem");
        }
        entry.storeValues.set(store, resource);
        this.triggerChange(iri);
    };

    private triggerChange(iri: string) {
        const entry = this.subscriptions.get(iri);
        if (!entry) {
            throw new Error("problem");
        }

        let isLoading = false;
        let validCoreResourceLink = null;
        let originatedStore = null;
        for (const [store, coreResourceLink] of entry.storeValues) {
            if (!coreResourceLink.isLoading && coreResourceLink.resource) {
                if (validCoreResourceLink) {
                    throw new Error("problem");
                }
                validCoreResourceLink = coreResourceLink.resource;
                originatedStore = store;
            }
            if (coreResourceLink.isLoading) {
                isLoading = true;
            }
        }

        const newIsLoading = isLoading;
        const newCurrentValue = validCoreResourceLink ??
        isLoading ? entry.currentValue.resource : null;

        if (entry.currentValue.isLoading !== newIsLoading || entry.currentValue.resource !== newCurrentValue) {
            entry.currentValue = {
                resource: newCurrentValue,
                isLoading: newIsLoading,
            }

            entry.subscribers.forEach(s => s(iri, entry.currentValue, this));
        }
        entry.originatedStore = originatedStore;
    }

    private async getOriginatedStoreForResource(iri: string): Promise<ObservableCoreResourceReaderWriter | null> {
        const store = this.subscriptions.get(iri)?.originatedStore;
        if (store) {
            return store;
        }

        return new Promise(resolve => {
            const subscriber = (iri: string, resource: CoreResourceLink) => {
                if (!resource.isLoading) {
                    const store = this.subscriptions.get(iri)?.originatedStore;
                    this.removeSubscriber(iri, subscriber);
                    resolve(store ?? null);
                }
            };

            this.addSubscriber(iri, subscriber);
        });


    }
}
