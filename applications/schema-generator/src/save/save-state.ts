import pako from "pako";
import {CoreOperation, CoreResource, MemoryStore} from "@model-driven-data/core/core";
import {pimExecutors} from "@model-driven-data/core/pim/executor";
import {dataPsmExecutors} from "@model-driven-data/core/data-psm/executor";
import {StoreWithMetadata} from "../store/federated-observable-store";

/**
 * All data that can be saved and restored
 */
interface ApplicationState {
    stores: StoreWithMetadata[];
    dataPsmSchemas: string[];
}


/**
 * Takes whole application state and stores it as a Uint8Array which can be saved as file.
 */
export function saveState({stores, dataPsmSchemas}: ApplicationState): Uint8Array {
    const fileStores: SaveFileStore[] = [];

    for (const store of stores) {
        // Every store.store is memory store
        const memoryStore = store.store as unknown as {
            baseIri: string;
            operations: CoreOperation[];
            resources: { [iri: string]: CoreResource };
        };

        fileStores.push(new V1StandardMemoryStore(memoryStore.baseIri, memoryStore.operations, memoryStore.resources));
    }

    const object: SaveFile = {
        $: "KODI schema generator https://github.com/sstenchlak/schema-generator",
        version: 1,
        date: (new Date()).toISOString(),
        data: {
            stores: fileStores,
            dataPsmSchemas
        }
    };

    const textData = JSON.stringify(object);

    const rawData = new TextEncoder().encode(textData);

    return pako.deflate(rawData);
}

/**
 * Inverse function to {@link saveState}
 */
export function restoreState(data: Uint8Array): ApplicationState {
    const rawData = pako.inflate(data);
    const text = new TextDecoder().decode(rawData);
    const object = JSON.parse(text) as SaveFile;

    const stores: StoreWithMetadata[] = [];

    for (const store of object.data.stores) {
        if (V1StandardMemoryStore.is(store)) {
            const memoryStore = MemoryStore.create(store.baseIri, [...pimExecutors, ...dataPsmExecutors]);

            const memoryStoreTyped = memoryStore as unknown as {
                operations: CoreOperation[];
                resources: { [iri: string]: CoreResource };
            };

            memoryStoreTyped.operations = store.operations;
            memoryStoreTyped.resources = store.resources;

            stores.push({
                store: memoryStore,
                metadata: {
                    tags: ["root", "data-psm", "pim"]
                },
            });
        }
    }

    return {
        dataPsmSchemas: object.data.dataPsmSchemas as string[],
        stores,
    }
}

/**
 * Structure of the object that represents the saved state
 */
interface SaveFile {
    $: "KODI schema generator https://github.com/sstenchlak/schema-generator",
    version: number,
    date: string,
    data: {
        stores: SaveFileStore[],
        dataPsmSchemas: string[],
    }
}

interface SaveFileStore {
    type: string,
}

class V1StandardMemoryStore {
    type = "V1StandardMemoryStore";
    baseIri: string;
    operations: CoreOperation[];
    resources: { [iri: string]: CoreResource };

    constructor(baseIri: string, operations: CoreOperation[], resources: { [p: string]: CoreResource }) {
        this.baseIri = baseIri;
        this.operations = operations;
        this.resources = resources;
    }

    static is(saveFileStore: SaveFileStore): saveFileStore is V1StandardMemoryStore {
        return saveFileStore.type === "V1StandardMemoryStore";
    }
}
