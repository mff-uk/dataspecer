import {Resource} from "./resource";

type ResourceMap = {[iri: string]: Resource | null};

/**
 * Interprets model data and provides them as JavaScript {@link Resource} objects.
 */
export interface Model {
    /**
     * Returns multiple resources from the model.
     *
     * It may or may not return a promise depending on the implementation. Use `await` to get the result. For more
     * optimized reading use synchronous implementation for non-async models.
     * @param iris IRIs from the given model to be returned
     * @return resources from the model as key-value map where key is IRI of the resource. You are guaranteed to get
     * result for each IRI you requested. If resource does not exist, value is `null`.
     */
    getResources(iris: string[]): Promise<ResourceMap> | ResourceMap;
}
