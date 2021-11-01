import {CoreResourceLink} from "./core-resource-link";
import {ComplexOperation} from "./complex-operation";
import {OperationExecutor, StoreDescriptor} from "./operation-executor";
import {
    CoreOperation,
    CoreOperationResult,
    CoreResource,
    CoreResourceReader,
    CoreResourceWriter
} from "model-driven-data/core";

export interface StoreWithMetadata {
    store: CoreResourceReader & (CoreResourceWriter | {});
    metadata: object;
}

export type Subscriber = (iri: string, resource: CoreResourceLink) => void;

interface Subscription {
    // Computed property from store values.
    currentValue: CoreResourceLink;
    originatedStore: StoreWithMetadata | null;

    /**
     * The {@link CoreResourceLink} is used differently here. We only need to distinguish the following states:
     *  - resource is being loaded (the {@link CoreResourceLink.resource} is irrelevant
     *  - store already responded
     */
    storeValues: Map<StoreWithMetadata, CoreResourceLink | null>;

    subscribers: Subscriber[];
}

class OperationExecutorForFederatedObservableStore implements OperationExecutor {
    public applyOperation: (operation: CoreOperation, storeDescriptor: StoreDescriptor) => Promise<CoreOperationResult>;
    public store: CoreResourceReader;

    constructor(applyOperation: (operation: CoreOperation, storeDescriptor: StoreDescriptor) => Promise<CoreOperationResult>, store: CoreResourceReader) {
        this.applyOperation = applyOperation;
        this.store = store;
    };
}

export class FederatedObservableStore implements CoreResourceReader {
    private stores: StoreWithMetadata[] = [];
    private subscriptions: Map<string, Subscription> = new Map();
    // This store is passed to operations to read resources that are internally cached
    private readonly storeForOperations: CoreResourceReader;

    // We will use lazy loading of resources during the operation execution. Only if needed the check method is called
    private resourcesToCheckAfterOperation: Set<string> = new Set();

    constructor() {
        this.storeForOperations = {
            readResource: iri => {
                if (this.resourcesToCheckAfterOperation.has(iri)) {
                    // todo this is not optimal because it triggers all subscribers, but this can be ignored if operations do not request resources all over again
                    this.check(iri);
                    this.resourcesToCheckAfterOperation.delete(iri);
                }
                return this.readResource(iri);
            },
            listResourcesOfType: typeIri => this.listResourcesOfType(typeIri),
            listResources: () => this.listResources(),
        }
    }

    addStore(store: StoreWithMetadata) {
        if (this.stores.includes(store)) {
            throw new Error("Store already presented in FederatedObservableCoreModelReaderWriter.");
        }

        this.stores.push(store);

        for (const [iri, subscription] of this.subscriptions) {
            subscription.storeValues.set(store, null);
            this.check(iri);
        }
    }

    removeStore(store: StoreWithMetadata) {
        if (!this.stores.includes(store)) {
            throw new Error("Unable to remove store from FederatedObservableCoreModelReaderWriter because it does not exists.");
        }

        this.stores = this.stores.filter(s => s !== store);
        this.subscriptions.forEach((subscription,iri) => {
            subscription.storeValues.delete(store);
            this.check(iri);
        });
    }

    addSubscriber(iri: string, subscriber: Subscriber) {
        if (!this.subscriptions.has(iri)) {
            this.subscriptions.set(iri, {
                currentValue: {
                    resource: null,
                    isLoading: false,
                },
                storeValues: new Map(this.stores.map(s => [s, null])),
                subscribers: [],
                originatedStore: null,
            });

            this.check(iri); // ask every store
        }

        const subscription = this.subscriptions.get(iri) as Subscription;

        subscription.subscribers.push(subscriber);
        subscriber(iri, subscription.currentValue);
    }

    removeSubscriber(iri: string, subscriber: Subscriber) {
        const entry = this.subscriptions.get(iri) as Subscription;
        entry.subscribers = entry.subscribers.filter(s => s !== subscriber);
        if (entry.subscribers.length === 0) {
            this.subscriptions.delete(iri);
        }
    }

    forceReload(iri: string) {
        const subscription = this.subscriptions.get(iri);

        if (subscription) {
            subscription.storeValues = new Map<StoreWithMetadata, CoreResourceLink | null>(this.stores.map(s => [s, null]));
            this.check(iri);
        }
    }

    optimizeGetCachedValue(iri: string) {
        return this.subscriptions.get(iri)?.currentValue;
    }

    getStores(): StoreWithMetadata[] {
        return this.stores;
    }

    async listResources(): Promise<string[]> {
        const resources = new Set<string>();
        for (const store of this.stores) {
            (await store.store.listResources()).forEach(resource => resources.add(resource));
        }
        return [...resources];
    }

    async listResourcesOfType(typeIri: string): Promise<string[]> {
        const resources = new Set<string>();
        for (const store of this.stores) {
            (await store.store.listResourcesOfType(typeIri)).forEach(resource => resources.add(resource));
        }
        return [...resources];
    }

    readResource(iri: string): Promise<CoreResource|null> {
        return new Promise(resolve => {
            const subscriber: Subscriber = (iri1, resource) => {
                if (!resource.isLoading) {
                    this.removeSubscriber(iri, subscriber);
                    resolve(resource.resource);
                }
            }
            this.addSubscriber(iri, subscriber);
        });
    };

    async executeOperation(operation: ComplexOperation) {
        const executor = new OperationExecutorForFederatedObservableStore(this.applyOperationForExecutor, this.storeForOperations);
        try {
            await operation.execute(executor);
        } catch (e) {
            console.warn("Operation failed", e);
        }

        for (const iri of this.resourcesToCheckAfterOperation) {
            const subscription = this.subscriptions.get(iri);
            if (subscription) {
                this.check(iri);
            }
        }
        this.resourcesToCheckAfterOperation.clear();
    }

    private applyOperationForExecutor = async (operation: CoreOperation, storeDescriptor: StoreDescriptor) => {
        // todo store descriptor is ignored for now and the first store is chosen for every operation
        const store = this.stores[0];

        const result = await (store.store as CoreResourceWriter).applyOperation(operation);

        for (const changedIri of result.changed) {
            const subscription = this.subscriptions.get(changedIri);
            if (subscription && subscription.storeValues.has(store)) {
                subscription.storeValues.set(store, null);
                // this.check(changedIri);
                this.resourcesToCheckAfterOperation.add(changedIri);
            }
        }

        for (const deletedIri of result.deleted) {
            const subscription = this.subscriptions.get(deletedIri);
            if (subscription && subscription.storeValues.has(store)) {
                subscription.storeValues.set(store, {
                    isLoading: false,
                    resource: null,
                });
                // this.check(deletedIri);
                this.resourcesToCheckAfterOperation.add(deletedIri);
            }
        }

        return result;
    }

    /**
     * This function is called when list of stores is changed or whether a store started or ended loading. The purpose
     * of this function is to keep everything in consistent state.
     * @param iri
     * @private
     */
    private check(iri: string) {
        const subscription = this.subscriptions.get(iri) as Subscription;

        let forStore: StoreWithMetadata | null = null;
        let value: CoreResource | null = null;
        let isLoading: boolean = false;

        for (let [store, link] of subscription.storeValues) {
            if (!link) {
                // We need to fetch new value
                store.store.readResource(iri).then(resource => {
                    const subscription = this.subscriptions.get(iri);
                    // The store and the subscription still must exists
                    if (subscription && subscription.storeValues.has(store)) {
                        const entry = subscription.storeValues.get(store) as CoreResourceLink;
                        entry.resource = resource;
                        entry.isLoading = false;
                        this.check(iri);
                    }
                });

                link = {resource: null, isLoading: true};
                subscription.storeValues.set(store, link);
            }

            if (link.isLoading) {
                isLoading = true;
            } else {
                if (link.resource) {
                    // We know the resource
                    if (value) {
                        console.info(`First store and value:`, forStore, value);
                        console.info(`Second store and value:`, store, link.resource);
                        throw new Error(`Multiple stores responded for ${iri}. Currently, positive responses are accepted from only single store.`);
                    }

                    forStore = store;
                    value = link.resource;
                }
            }
        }

        const newIsLoading = isLoading && !value; // Loading is set to true only if the resource has not been found yet.
        const newCurrentValue = value ??
            (isLoading ? subscription.currentValue.resource : null);

        // Check if new* values differs from others
        if (subscription.currentValue.isLoading !== newIsLoading || subscription.currentValue.resource !== newCurrentValue) {
            subscription.currentValue = {
                resource: newCurrentValue,
                isLoading: newIsLoading,
            }

            subscription.subscribers.forEach(s => s(iri, subscription.currentValue));
        }
        subscription.originatedStore = forStore;
    }
}
