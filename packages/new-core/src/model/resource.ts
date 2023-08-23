/**
 * Represents JavaScript interpretation of the smallest unit of information in the model that is identified by an IRI.
 */
export interface Resource {
    /**
     * Unique identifier of the resource in the given model
     */
    iri: string;

    /**
     * List of types of the resource as IRIs
     */
    type: string[];
}