import {CoreOperation, CoreOperationExecutor, CoreOperationResult, CoreResource, CoreResourceReader, CoreResourceWriter, CreateNewIdentifier, MemoryStore} from "model-driven-data/core";

const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

export class SyncMemoryStore implements CoreResourceReader, CoreResourceWriter {
    protected remoteUrl: string;
    protected memoryStore: Omit<MemoryStore, "operations" | "resources"> & {
        operations: CoreOperation[];
        resources: { [iri: string]: CoreResource };
    };

    constructor(
        baseIri: string,
        executors: CoreOperationExecutor<any>[],
        createNewIdentifier: CreateNewIdentifier | null = null,
        remoteUrl: string,
    ) {
        // @ts-ignore
        this.memoryStore = MemoryStore.create(baseIri, executors, createNewIdentifier);
        this.remoteUrl = remoteUrl;
    }

    listResources(): Promise<string[]> {
        return this.memoryStore.listResources();
    }
    listResourcesOfType(typeIri: string): Promise<string[]> {
        return this.memoryStore.listResourcesOfType(typeIri);
    }
    readResource(iri: string): Promise<CoreResource> {
        return this.memoryStore.readResource(iri);
    }
    applyOperation(operation: CoreOperation): Promise<CoreOperationResult> {
        return this.memoryStore.applyOperation(operation);
    }

    readResourceSync(iri: string): CoreResource | null {
        return this.memoryStore.resources[iri] ?? null;
    }

    /**
     * Saves content of the store to the Internet
     */
    async saveStore() {
        const operations = this.memoryStore.operations;
        const resources = this.memoryStore.resources;

        const body = JSON.stringify({operations, resources});

        await fetch(this.remoteUrl, {method: 'PUT', headers, body});
    }

    async loadStore() {
        const fetchData = await fetch(this.remoteUrl, {method: 'GET', headers});
        const rawObject = await fetchData.json();

        this.memoryStore.operations = rawObject.operations;
        this.memoryStore.resources = rawObject.resources;
    }
}
