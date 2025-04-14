import {HttpFetch} from "@dataspecer/core/io/fetch/fetch-api";
import {InMemoryEntityModel} from "./in-memory-entity-model.ts";
import {HttpSynchronizedStoreConnector} from "@dataspecer/backend-utils/connectors";
import {Entity} from "./entity.ts";
import {HttpStoreDescriptor} from "@dataspecer/backend-utils/store-descriptor";
import {HttpSynchronizedStore} from "@dataspecer/backend-utils/stores";

/**
 * Type of in-memory entity model that can be synchronized with the server.
 */
export class HttpEntityModel extends InMemoryEntityModel {
    private connector: HttpSynchronizedStoreConnector;

    constructor(url: string, httpFetch: HttpFetch) {
        super();
        this.connector = new HttpSynchronizedStoreConnector(url, httpFetch);
        this.subscribeToChanges(() => this.save());
    }

    async save() {
        const resources = this.getEntities();
        await this.connector.save({operations: [], resources: resources as any});
    }

    async load() {
        const {resources} = await this.connector.load();
        this.change(resources as unknown as Record<string, Entity>, Object.keys(this.getEntities()));
    }

    static createFromDescriptor(descriptor: any, httpFetch: HttpFetch): HttpEntityModel {
        if (!HttpSynchronizedStore.supportsDescriptor(descriptor)) {
            throw new Error("The given descriptor is not supported.");
        }
        const {url} = descriptor as HttpStoreDescriptor;
        return new HttpEntityModel(url as string, httpFetch);
    }
}