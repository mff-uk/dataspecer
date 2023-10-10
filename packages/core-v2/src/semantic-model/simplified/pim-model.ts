import {BackendConnector} from "@dataspecer/backend-utils/connectors";
import {HttpFetch} from "@dataspecer/core/io/fetch/fetch-api";
import {HttpSynchronizedStore} from "@dataspecer/backend-utils/stores";
import {PimStoreWrapper} from "../v1-adapters/pim-store-wrapper";

export async function createPimModel(dataspecerBackendUrl: string, dataSpecificationIri: string, httpFetch: HttpFetch): Promise<PimStoreWrapper> {
    const connector = new BackendConnector(dataspecerBackendUrl, httpFetch);
    const dataSpecification = await connector.readDataSpecification(dataSpecificationIri);
    const store = HttpSynchronizedStore.createFromDescriptor(dataSpecification.pimStores[0], httpFetch);
    const storeWrapper = new PimStoreWrapper(store);
    await store.load();
    storeWrapper.fetchFromPimStore();
    return storeWrapper;
}