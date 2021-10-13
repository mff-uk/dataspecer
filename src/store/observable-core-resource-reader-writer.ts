import {ComplexOperation} from "./complex-operation";
import {CoreResourceLink} from "./core-resource-link";

export type Subscriber = (iri: string, resource: CoreResourceLink, store: ObservableCoreResourceReaderWriter) => void;

/**
 * Wraps CoreResourceReader and allows reading of resources only through subscriber model. First,
 * you need to subscribe to particular resource by its IRI and then you are notified about changes until the
 * subscription is cancelled.
 *
 * Allows to execute complex operations on the store.
 */
export interface ObservableCoreResourceReaderWriter {
    addSubscriber(iri: string, subscriber: Subscriber): void;
    removeSubscriber(iri: string, subscriber: Subscriber): void;
    executeOperation(operation: ComplexOperation): Promise<void>;
}
