import {CoreResourceReader} from "@dataspecer/core/core";
import {Entity} from "../../entity-model/entity";
import {InMemoryEntityModel} from "../../entity-model/implementation";

import {transformCoreResources} from "./transform-core-resources";

function deepEqual(a: any, b: any): boolean {
    if (a === b) {
        return true;
    }
    if (typeof a == "object" && typeof b == "object") {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length != keysB.length) {
            return false;
        }
        for (const key of keysA) {
            if (!keysB.includes(key)) {
                return false;
            }
            if (!deepEqual(a[key], b[key])) {
                return false;
            }
        }
        return true;
    }
    return false;
}

export class PimStoreWrapper extends InMemoryEntityModel {
    private pimStore: CoreResourceReader;

    constructor(pimStore: CoreResourceReader) {
        super();
        this.pimStore = pimStore;
    }

    public fetchFromPimStore() {
        const result = transformCoreResources((this.pimStore as any).resources);

        const deleted: string[] = [];
        const updated: Record<string, Entity> = {};

        // First remove entities that are not present
        const oldIris = Object.keys(this.entities);
        for (const iri of oldIris) {
            if (!result[iri]) {
                deleted.push(iri);
            }
        }

        // Update new
        for (const iri in result) {
            const entity = result[iri];
            if (!deepEqual(entity, this.entities[iri])) {
                updated[iri] = entity;
            }
        }

        this.change(updated, deleted);
    }
}