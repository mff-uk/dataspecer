import {ConfigurationStore} from "../../configuration";
import {SyncMemoryStore} from "./sync-memory-store";
import {dataPsmExecutors} from "model-driven-data/data-psm/executor";
import {pimExecutors} from "model-driven-data/pim/executor";

export interface SyncMemoryStoreConfigurationStore extends ConfigurationStore {
    type: typeof SyncMemoryStoreConfigurationStoreBuilder.CONFIGURATION_STORE_TYPE;
    url: string;
}

export class SyncMemoryStoreConfigurationStoreBuilder {
    static CONFIGURATION_STORE_TYPE: "sync-memory-store" = "sync-memory-store";

    private store: SyncMemoryStoreConfigurationStore;

    constructor(store: SyncMemoryStoreConfigurationStore) {
        this.store = store;
    }

    static accepts(configurationStore: ConfigurationStore): configurationStore is SyncMemoryStoreConfigurationStore {
        return configurationStore.type === SyncMemoryStoreConfigurationStoreBuilder.CONFIGURATION_STORE_TYPE;
    }

    build(): SyncMemoryStore {
        return new SyncMemoryStore("https://ofn.gov.cz", [...dataPsmExecutors, ...pimExecutors], null, this.store.url);
    }
}
