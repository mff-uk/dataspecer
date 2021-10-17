import {ComplexOperation} from "./complex-operation";
import {CoreResourceLink} from "./core-resource-link";
import {CoreResource, CoreResourceReader} from "model-driven-data/core";

export type Subscriber = (iri: string, resource: CoreResourceLink, store: ObservableCoreResourceReaderWriter) => void;

/**
 * Wraps CoreResourceReader and allows reading of resources only through subscriber model. First,
 * you need to subscribe to particular resource by its IRI and then you are notified about changes until the
 * subscription is cancelled.
 *
 * Allows to execute complex operations on the store.
 */
export abstract class ObservableCoreResourceReaderWriter implements CoreResourceReader {
    abstract addSubscriber(iri: string, subscriber: Subscriber): void;
    abstract removeSubscriber(iri: string, subscriber: Subscriber): void;
    abstract executeOperation(operation: ComplexOperation): Promise<void>;

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

    abstract listResources(): Promise<string[]>;

    abstract listResourcesOfType(typeIri: string): Promise<string[]>;
}
