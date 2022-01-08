import {Resource, ResourceInfo} from "./resource";
import {ComplexOperation} from "./complex-operation";
import {OperationExecutor, StoreByPropertyDescriptor, StoreDescriptor, StoreHavingResourceDescriptor} from "./operation-executor";
import {PimAssociation, PimAttribute, PimClass} from "model-driven-data/pim/model";
import {CoreOperation, CoreOperationResult, CoreResource, CoreResourceReader, CoreResourceWriter, MemoryStore} from "model-driven-data/core";
import {ConfigurationStoreMetadata} from "../configuration";
import {SyncMemoryStore} from "./core-stores/sync-memory-store";
import {cloneResource} from "./clone-resource";

export interface StoreWithMetadata {
    store: CoreResourceReader & (CoreResourceWriter | {});
    metadata: ConfigurationStoreMetadata;
}

export function isReadOnly(store: StoreWithMetadata | null): boolean {
    return store !== null && store.metadata.tags.includes("read-only");
}

// todo: This is temporary until the method for reverse lookup is implemented into the CoreResourceReader
export type _CoreResourceReader_WithMissingMethods = Omit<CoreResourceReader, "listResourcesOfType"> & Pick<FederatedObservableStore, "getPimHavingInterpretation" | "listResourcesOfType">;

export type Subscriber = (iri: string, resource: Resource & ResourceInfo) => void;

// The idea is that the old value stays if it makes sense
interface Subscription {
    // Computed property from store values.
    currentValue: Resource & ResourceInfo;

    /**
     * The {@link Resource} is used differently here. We only need to distinguish the following states:
     *  - resource is being loaded (the {@link Resource.resource} is irrelevant
     *  - store already responded
     */
    storeValues: Map<StoreWithMetadata, Resource | null>;

    subscribers: Subscriber[];
}

class OperationExecutorForFederatedObservableStore implements OperationExecutor {
    public applyOperation: (operation: CoreOperation, storeDescriptor: StoreDescriptor) => Promise<CoreOperationResult>;
    public store: _CoreResourceReader_WithMissingMethods;

    constructor(applyOperation: (operation: CoreOperation, storeDescriptor: StoreDescriptor) => Promise<CoreOperationResult>, store: _CoreResourceReader_WithMissingMethods) {
        this.applyOperation = applyOperation;
        this.store = store;
    };
}

export class FederatedObservableStore implements _CoreResourceReader_WithMissingMethods {
    private stores: StoreWithMetadata[] = [];
    private subscriptions: Map<string, Subscription> = new Map();
    // This store is passed to operations to read resources that are internally cached
    private readonly storeForOperations: _CoreResourceReader_WithMissingMethods;
    // We will use lazy loading of resources during the operation execution. Only if needed the check method is called
    private resourcesToCheckAfterOperation: Set<string> = new Set();
    private eventListeners: Map<string, Set<() => void>> = new Map();

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
            listResourcesOfType: (typeIri, storeDescriptor: StoreDescriptor | undefined = undefined) => this.listResourcesOfType(typeIri, storeDescriptor),
            listResources: () => this.listResources(),
            getPimHavingInterpretation: (pimInterpretation: string, storeDescriptor: StoreDescriptor) => this.getPimHavingInterpretation(pimInterpretation, storeDescriptor),
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
        this.subscriptions.forEach((subscription, iri) => {
            subscription.storeValues.delete(store);
            this.check(iri);
        });
    }

    addSubscriber(iri: string, subscriber: Subscriber) {
        if (!this.subscriptions.has(iri)) {
            this.createSubscriptionForNewResource(iri);
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
            subscription.storeValues = new Map<StoreWithMetadata, Resource | null>(this.stores.map(s => [s, null]));
            this.check(iri);
        }
    }

    /**
     * Returns the {@link Resource & ResourceInfo} for given iri
     *
     * By calling this method the caller guarantees that eventually it will subscribe.
     * @param iri
     */
    optimizePreSubscribe<ResourceType extends CoreResource>(iri: string): Resource<ResourceType> & ResourceInfo {
        if (!this.subscriptions.has(iri)) {
            this.createSubscriptionForNewResource(iri);
        }

        const subscription = this.subscriptions.get(iri) as Subscription;
        return subscription.currentValue as Resource<ResourceType> & ResourceInfo;
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

    async listResourcesOfType(typeIri: string, storeDescriptor: StoreDescriptor | undefined = undefined): Promise<string[]> {
        const stores = storeDescriptor ? await this.getStoresByStoreDescriptor(storeDescriptor) : this.stores;
        const resources = new Set<string>();
        for (const store of stores) {
            (await store.store.listResourcesOfType(typeIri)).forEach(resource => resources.add(resource));
        }
        return [...resources];
    }

    readResource(iri: string): Promise<CoreResource | null> {
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
            const subscription = this.subscriptions.has(iri);
            if (subscription) {
                this.check(iri);
            }
        }
        this.resourcesToCheckAfterOperation.clear();

        this.eventListeners.get("afterOperationExecuted")?.forEach(l => l());
    }

    public addEventListener(event: string, listener: () => void) {
        let entry = this.eventListeners.get(event);
        if (!entry) {
            entry = new Set();
            this.eventListeners.set(event, entry);
        }

        entry.add(listener);
    }

    public removeEventListener(event: string, listener: () => void) {
        let entry = this.eventListeners.get(event) as Set<() => void>;
        entry.delete(listener);
        if (entry.size === 0) {
            this.eventListeners.delete(event);
        }
    }

    /**
     * For the given CIM iri and store descriptor it returns a single IRI of PIM resource of that store whose
     * interpretation is the given CIM iri. If no such resource exists, null is returned.
     * @param pimInterpretation
     * @param storeDescriptor
     */
    async getPimHavingInterpretation(pimInterpretation: string, storeDescriptor: StoreDescriptor): Promise<string | null> {
        const store = await this.getSingleStoreByStoreDescriptor(storeDescriptor);

        // Fast search
        const visitedResources = new Set<string>();
        for (const [iri, subscription] of this.subscriptions) {
            if (!subscription.currentValue.isLoading &&
                subscription.currentValue.resource &&
                subscription.currentValue.store === store) {

                visitedResources.add(iri);
                if ((PimAssociation.is(subscription.currentValue.resource)
                        || PimAttribute.is(subscription.currentValue.resource)
                        || PimClass.is(subscription.currentValue.resource)) &&
                    subscription.currentValue.resource.pimInterpretation === pimInterpretation
                ) {
                    return iri;
                }
            }
        }

        // Search the rest
        const allResources = await store.store.listResources();
        for (const iri of allResources) {
            if (visitedResources.has(iri)) {
                continue;
            }

            const resource = await this.readResource(iri);
            if ((PimAssociation.is(resource)
                    || PimAttribute.is(resource)
                    || PimClass.is(resource)) &&
                resource.pimInterpretation === pimInterpretation
            ) {
                return iri;
            }
        }

        return null;
    }

    private createSubscriptionForNewResource(iri: string) {
        this.subscriptions.set(iri, {
            currentValue: {
                resource: null,
                isLoading: false,
                store: null,
            },
            storeValues: new Map(this.stores.map(s => [s, null])),
            subscribers: [],
        });

        this.check(iri); // ask every store
    }

    private applyOperationForExecutor = async (operation: CoreOperation, storeDescriptor: StoreDescriptor) => {
        const store = await this.getSingleStoreByStoreDescriptor(storeDescriptor);

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
                link = this.storeReadResource(store, iri);
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
        if (
            subscription.currentValue.isLoading !== newIsLoading ||
            subscription.currentValue.resource !== newCurrentValue ||
            subscription.currentValue.store !== forStore
        ) {
            subscription.currentValue = {
                resource: newCurrentValue,
                isLoading: newIsLoading,
                store: forStore,
            }

            subscription.subscribers.forEach(s => s(iri, subscription.currentValue));
        }
    }

    /**
     * For given store and iri, start reloading the resource.
     * @param storeWithMetadata
     * @param iri
     * @private
     */
    private storeReadResource(storeWithMetadata: StoreWithMetadata, iri: string) {
        const subscription = this.subscriptions.get(iri) as Subscription;
        const store = storeWithMetadata.store;

        let resource: Resource;

        if (store instanceof SyncMemoryStore) {
            resource = {
                resource: cloneResource(store.readResourceSync(iri)),
                isLoading: false,
            }
        } else if (store instanceof MemoryStore) {
            resource = {
                resource: cloneResource((store as unknown as { resources: { [iri: string]: CoreResource } }).resources[iri] ?? null),
                isLoading: false,
            }
        } else {
            // We need to fetch new value
            store.readResource(iri).then(resource => {
                const subscription = this.subscriptions.get(iri);
                // The store and the subscription still must exists
                if (subscription && subscription.storeValues.has(storeWithMetadata)) {
                    const entry = subscription.storeValues.get(storeWithMetadata) as Resource;
                    entry.resource = cloneResource(resource);
                    entry.isLoading = false;
                    this.check(iri);
                }
            });

            resource = {resource: null, isLoading: true};
        }

        subscription.storeValues.set(storeWithMetadata, resource);
        return resource;
    }

    private async getStoresByStoreDescriptor(storeDescriptor: StoreDescriptor): Promise<StoreWithMetadata[]> {
        let foundStores: Set<StoreWithMetadata> = new Set<StoreWithMetadata>();

        if (StoreHavingResourceDescriptor.is(storeDescriptor)) {
            const originatedStore = this.subscriptions.get(storeDescriptor.resource)?.currentValue.store;
            if (originatedStore) {
                foundStores.add(originatedStore);
            } else {
                foundStores.add(await new Promise(resolve => {
                    const subscriber: Subscriber = (iri1, resource) => {
                        if (!resource.isLoading) {
                            const originatedStore = this.subscriptions.get(storeDescriptor.resource)?.currentValue.store;
                            this.removeSubscriber(storeDescriptor.resource, subscriber);
                            if (!originatedStore) {
                                console.log("resource from StoreHavingResourceDescriptor", storeDescriptor.resource);
                                throw new Error("Unable to find resource specified by the store descriptor and therefore no store matches the criteria. This probably means, that the application does not know which store should be used for writing.");
                            }
                            resolve(originatedStore as StoreWithMetadata);
                        }
                    }
                    this.addSubscriber(storeDescriptor.resource, subscriber);
                }));
            }

        } else if (StoreByPropertyDescriptor.is(storeDescriptor)) {
            for (const store of this.stores) {
                if (storeDescriptor.property.every(p => store.metadata.tags.includes(p as any))) {
                    foundStores.add(store);
                }
            }
        } else {
            console.log("store descriptor:", storeDescriptor);
            throw new Error("Unknown store descriptor.");
        }

        return [...foundStores];
    }

    private async getSingleStoreByStoreDescriptor(storeDescriptor: StoreDescriptor): Promise<StoreWithMetadata> {
        const foundStores = await this.getStoresByStoreDescriptor(storeDescriptor);
        if (foundStores.length === 0) {
            console.log("store descriptor:", storeDescriptor);
            throw new Error("No store matches provided store descriptor. This probably means, that the application does not know which store should be used for writing.");
        }

        if (foundStores.length > 1) {
            console.log("store descriptor:", storeDescriptor);
            console.log("matching stores:", foundStores);
            throw new Error("Multiple store matches provided store descriptor. This probably means, that the application does not know which store should be used for writing.");
        }

        return foundStores[0];
    }
}
