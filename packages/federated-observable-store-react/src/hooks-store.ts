import {CoreResourceReader} from "@model-driven-data/core/core/core-reader";
import {useContext, useEffect, useState} from "react";
import {FederatedObservableStore} from "@model-driven-data/federated-observable-store/federated-observable-store";
import {StoreContext} from "./store-context";

interface StoreData {
    store: CoreResourceReader;
}

/**
 * Creates a new store from given CoreResourceReaders.
 * The store needs to be passed to context.
 * @param stores
 */
export const useNewFederatedObservableStore = (stores: StoreData[]) => {
    const [store] = useState(new FederatedObservableStore());
    useEffect(() => {
        stores.forEach(storeData => store.addStore(storeData.store));
        return () => {
            stores.forEach(storeData => store.removeStore(storeData.store));
        };
    }, [store, stores]);

    return store;
}

/**
 * Adds given CoreResourceReaders to the store.
 * @param stores
 */
export const useAdditionalStores = (stores: StoreData[]) => {
    const store = useContext(StoreContext);
    useEffect(() => {
        stores.forEach(storeData => store.addStore(storeData.store));
        return () => {
            stores.forEach(storeData => store.removeStore(storeData.store));
        };
    }, [store, stores]);
}

/**
 * Returns the current store.
 */
export const useFederatedObservableStore = () => useContext(StoreContext);
