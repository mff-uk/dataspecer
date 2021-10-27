import {CoreOperation, CoreOperationResult, CoreResourceReader, CoreResourceWriter} from "model-driven-data/core";
import {ComplexOperation} from "./complex-operation";
import {OperationExecutor, StoreDescriptor} from "./operation-executor";
import {ObservableCoreResourceReaderWriter, Subscriber} from "./observable-core-resource-reader-writer";
import {CoreResourceLink} from "./core-resource-link";

class OperationExecutorForSingleStore implements OperationExecutor {
    public changed: Set<string> = new Set<string>();
    public deleted: Set<string> = new Set<string>();
    public store: ObservableCoreResourceReaderWriter;

    private rawStore: CoreResourceWriter & CoreResourceReader;

    constructor(rawStore: CoreResourceWriter & CoreResourceReader, store: ObservableCoreResourceReaderWriter) {
        this.rawStore = rawStore;
        this.store = store;
    }

    async applyOperation(operation: CoreOperation, storeDescriptor: StoreDescriptor): Promise<CoreOperationResult> {
        // We will ignore the value in storeDescriptor

        const result = await this.rawStore.applyOperation(operation);
        result.changed.forEach(i => this.changed.add(i));
        result.deleted.forEach(i => this.deleted.add(i));

        return result;
    }
}

/**
 * Wraps a single model-driven-data store into {@link ObservableCoreResourceReaderWriter} and caches all the subscribed
 * resources.
 */
export class ObservableCachedCoreResourceReaderWriter extends ObservableCoreResourceReaderWriter {
    // model-driven-data store
    public readonly store: CoreResourceReader & CoreResourceWriter;
    // list of subscribed IRIs and subscribers to them
    protected subscriptions = new Map<string, Set<Subscriber>>();
    // Cache of all resources used by at least one subscriber.
    protected resourceCache: Map<string, CoreResourceLink> = new Map();

    constructor(store: CoreResourceReader & CoreResourceWriter) {
        super();
        this.store = store;
    }

    forceReload(iri: string) {
        this.reloadResources([iri]);
    }

    listResourcesOfType(typeIri: string): Promise<string[]> {
        return this.store.listResourcesOfType(typeIri);
    }

    listResources(): Promise<string[]> {
        return this.store.listResources();
    }

    /**
     * Registers a new subscriber and fires a notify event synchronously on him.
     */
    addSubscriber(iri: string, subscriber: Subscriber) {
        let subscriptionSet = this.subscriptions.get(iri);
        if (!subscriptionSet) { // This also mean that resourceCache has no entry for IRI
            subscriptionSet = new Set<Subscriber>();
            this.subscriptions.set(iri, subscriptionSet);
            this.reloadResources([iri]);
        }

        if (subscriptionSet.has(subscriber)) {
            throw new Error(`The function is already in the subscription set for ${iri}.`);
        }
        subscriptionSet.add(subscriber);

        subscriber(iri, this.resourceCache.get(iri) as CoreResourceLink, this);
    }

    removeSubscriber(iri: string, subscriber: Subscriber) {
        if (this.subscriptions.get(iri)?.has(subscriber) !== true) {
            throw new Error(`Unable to remove subscriber for ${iri} because it has not been registered.`);
        }

        this.subscriptions.get(iri)?.delete(subscriber);
        if (this.subscriptions.get(iri)?.size === 0) {
            this.subscriptions.delete(iri);
            this.resourceCache.delete(iri);
        }
    }

    async executeOperation(operation: ComplexOperation): Promise<void> {
        const executor = new OperationExecutorForSingleStore(this.store, this);
        await operation.execute(executor);
        this.reloadResources([...executor.changed]);
        this.markAsDeleted([...executor.deleted]);
    }

    protected markAsDeleted(iris: string[]) {
        for (const iri of iris) {
            if (this.resourceCache.has(iri)) {
                this.resourceCache.set(iri, {
                    resource: null,
                    isLoading: false,
                });
            }
        }
    }

    protected notifySubscribersOnResource(iri: string) {
        const resource = this.resourceCache.get(iri) as CoreResourceLink;
        this.subscriptions.get(iri)?.forEach(subscriber => subscriber(iri, resource, this));
    }

    protected reloadResources(iris: string[]) {
        for (const iri of iris) {
            if (this.resourceCache.has(iri)) {
                const entry = this.resourceCache.get(iri) as CoreResourceLink;
                if (!entry.isLoading) {
                    this.resourceCache.set(iri, {
                        resource: entry.resource,
                        isLoading: true
                    });
                    this.notifySubscribersOnResource(iri);
                }
            } else {
                this.resourceCache.set(iri, {
                    resource: null,
                    isLoading: true,
                });
                this.notifySubscribersOnResource(iri);
            }
        }

        for (const iri of iris) {
            this.store.readResource(iri).then(resource => {
                const entry = this.resourceCache.get(iri);

                if (entry && (entry.isLoading || entry.resource !== resource)) {
                    this.resourceCache.set(iri, {
                        resource,
                        isLoading: false,
                    });
                    this.notifySubscribersOnResource(iri);
                }
            });
        }
    }
}
