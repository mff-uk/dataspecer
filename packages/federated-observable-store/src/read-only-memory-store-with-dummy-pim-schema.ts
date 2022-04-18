import {CoreResource, CoreResourceReader} from "@dataspecer/core/core";
import {PimSchema} from "@dataspecer/core/pim/model";

/**
 * Wraps a {@link CoreResourceReader} and adds a {@link PimSchema} with a given
 * IRI containing all the resources from the wrapped schema.
 *
 * This class is handy if you have a store with resources without schema,
 * because Federated observable store requires resources to have a schema to
 * work properly.
 */
export class ReadOnlyMemoryStoreWithDummyPimSchema implements CoreResourceReader {
    private readonly store: CoreResourceReader;
    private readonly schema: PimSchema;

    constructor(store: CoreResourceReader, schemaIri: string) {
        this.store = store;
        this.schema = new PimSchema(schemaIri);
    }

    async listResources(): Promise<string[]> {
        return [
            ...await this.store.listResources(),
            this.schema.iri as string,
        ]
    }

    async listResourcesOfType(typeIri: string): Promise<string[]> {
        if (this.schema.types.includes(typeIri)) {
            return [
                ...await this.store.listResourcesOfType(typeIri),
                this.schema.iri as string,
            ]
        } else {
            return this.store.listResourcesOfType(typeIri);
        }
    }

    async readResource(iri: string): Promise<CoreResource | null> {
        if (iri === this.schema.iri) {
            return {
                ...this.schema,
                pimParts: await this.store.listResources(),
            } as PimSchema
        } else {
            return this.store.readResource(iri);
        }
    }
}
