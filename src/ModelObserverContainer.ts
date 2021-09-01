import {
    CoreOperation,
    CoreOperationResult,
    CoreResource,
    CoreResourceReader,
    CoreResourceWriter
} from "model-driven-data/core";

export interface ModelObserverContainerResourceState<ResourceType extends CoreResource = CoreResource> {
    resource: ResourceType | undefined | null;
    isLoading: boolean;
    isError: boolean;
}

type SubscriberType = (state: ModelObserverContainerResourceState) => void;


export class ModelObserverContainer {
    public readonly model: CoreResourceWriter & CoreResourceReader;

    /**
     * List of not resolved request to the model. Symbol represents unique identifier of the promise. If is changed, it
     * means that the promise is outdated.
     * @protected
     */
    protected requestsInProgress: Map<string, Symbol> = new Map<string, Symbol>();

    /**
     * All resources are stored here with current state.
     * @protected
     */
    protected resourceStates: Map<string, ModelObserverContainerResourceState> = new Map<string, ModelObserverContainerResourceState>();

    protected subscribers = new Map<string, Set<SubscriberType>>();

    constructor(model: CoreResourceWriter & CoreResourceReader) {
        this.model = model;
    }

    reportChanged(changedResourceIris: string[]) {
        changedResourceIris.filter(i => this.subscribers.has(i)).forEach(i => this.requestForUpdate(i));
    };

    reportDeleted(deletedResourceIris: string[]) {
        deletedResourceIris.filter(i => this.subscribers.has(i)).forEach(i => this.updateStateSetResource(i, null));
    };

    /**
     * Registers a new subscriber and immediately fires a notify event on him.
     */
    addSubscriber(forResourceIri: string, subscriber: SubscriberType) {
        let shouldRequestForUpdate = false;
        if (!this.subscribers.has(forResourceIri)) {
            this.subscribers.set(forResourceIri, new Set<SubscriberType>());
            shouldRequestForUpdate = true;
        }

        (this.subscribers.get(forResourceIri) as Set<SubscriberType>).add(subscriber);

        if (shouldRequestForUpdate) {
            this.requestForUpdate(forResourceIri).then();
        } else {
            subscriber(this.resourceStates.get(forResourceIri) as ModelObserverContainerResourceState);
        }
    }

    removeSubscriber(forResourceIri: string, subscriber: SubscriberType) {
        const set = this.subscribers.get(forResourceIri) as Set<SubscriberType>;
        const success = set.delete(subscriber);
        if (!success) {
            throw new Error("Unable to unregister listener, because is not registered.");
        }

        if (set.size === 0) {
            this.subscribers.delete(forResourceIri);
            this.requestsInProgress.delete(forResourceIri);
            this.resourceStates.delete(forResourceIri);
        }
    }

    protected notifySubscribers(forResourceIri: string) {
        const state = this.resourceStates.get(forResourceIri) as ModelObserverContainerResourceState;
        const subscribers = this.subscribers.get(forResourceIri);
        if (subscribers) {
            subscribers.forEach(subscriber => subscriber(state));
        }
    }

    protected updateStateSetLoading(forResourceIri: string) {
        let current = this.resourceStates.get(forResourceIri);
        if (current?.isLoading !== true) {
            this.resourceStates.set(forResourceIri,
                {isError: false, resource: undefined, ...current, isLoading: true}
            );
            this.notifySubscribers(forResourceIri);
        }
    }

    protected updateStateSetError(forResourceIri: string) {
        let current = this.resourceStates.get(forResourceIri);
        if (current?.isError !== true || current?.isLoading === true) {
            this.resourceStates.set(forResourceIri,
                {resource: null, ...current, isLoading: false, isError: true}
            );
            this.notifySubscribers(forResourceIri);
        }
    }

    protected updateStateSetResource(forResourceIri: string, resource: CoreResource | null) {
        this.resourceStates.set(forResourceIri,
            {resource, isLoading: false, isError: false}
        );
        this.notifySubscribers(forResourceIri);
    }

    protected async requestForUpdate(forResourceIri: string) {
        const uid = Symbol();
        this.requestsInProgress.set(forResourceIri, uid);
        this.updateStateSetLoading(forResourceIri);

        const resource = await this.model.readResource(forResourceIri);

        if (this.requestsInProgress.get(forResourceIri) === uid) {
            if (resource) {
                this.updateStateSetResource(forResourceIri, resource);
            } else {
                this.updateStateSetError(forResourceIri);
            }
        }
    }
}

export interface StoreContainer {
    pim: ModelObserverContainer,
    dataPsm: ModelObserverContainer,
}

export async function ApplyOperationOnModelContainer(
    container: ModelObserverContainer,
    operation: CoreOperation,
): Promise<CoreOperationResult> {
    const result = await container.model.applyOperation(operation);
    container.reportChanged(result.changed);
    container.reportDeleted(result.deleted);

    return result;
}

export class MultipleOperationExecutor {
    private changed: Map<ModelObserverContainer, Set<string>> = new Map<ModelObserverContainer, Set<string>>();
    private deleted: Map<ModelObserverContainer, Set<string>> = new Map<ModelObserverContainer, Set<string>>();

    async applyOperation(container: ModelObserverContainer, operation: CoreOperation): Promise<CoreOperationResult> {
        const result = await container.model.applyOperation(operation);

        if (!this.changed.has(container)) {
            this.changed.set(container, new Set<string>());
        }
        const changed = this.changed.get(container) as Set<string>;
        result.changed.forEach(i => changed.add(i));

        if (!this.deleted.has(container)) {
            this.deleted.set(container, new Set<string>());
        }
        const deleted = this.deleted.get(container) as Set<string>;
        result.deleted.forEach(i => deleted.add(i));

        return result;
    }

    commit() {
        this.changed.forEach((set, model) => model.reportChanged([...set]));
        this.deleted.forEach((set, model) => model.reportDeleted([...set]));
    }

}
