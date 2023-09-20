import {ExternalSemanticModel} from "./model";
import {InMemorySemanticModel} from "./in-memory-model";
import {CimAdapter} from "@dataspecer/core/cim/cim-adapter";

/**
 * Adapter from {@link CimAdapter} from core version 1 to the {@link ExternalSemanticModel} from core version 2.
 */
export class CimAdapterWrapper extends InMemorySemanticModel implements ExternalSemanticModel {
    private cimAdapter: CimAdapter;

    constructor(cimAdapter: CimAdapter) {
        super();
        this.cimAdapter = cimAdapter;
    }

    addRequestedIds(entities: string[]): void {
    }

    deleteRequestedIds(entities: string[]): void {
    }
}
