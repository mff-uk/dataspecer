import {StoreDescriptor} from "@model-driven-data/backend-utils/store-descriptor";
import {FederatedObservableStore} from "@model-driven-data/federated-observable-store/federated-observable-store";
import {useEffect, useState} from "react";
import {CoreResourceReader} from "@model-driven-data/core/core";
import {isEqual} from "lodash";
import {EagerHttpSynchronizedStore} from "@model-driven-data/backend-utils/stores/eager-http-synchronized-store";
import {httpFetch} from "@model-driven-data/core/io/fetch/fetch-browser";

/**
 * Takes an array of store descriptors and registers them properly in the
 * {@link FederatedObservableStore}.
 * @param descriptors
 * @param federatedObservableStore
 */
export const useConstructedStoresFromDescriptors = (
    descriptors: StoreDescriptor[],
    federatedObservableStore: FederatedObservableStore,
) => {
    // Stores that are already created and handled by this hook.
    const [constructedStoreCache] = useState(new Map<StoreDescriptor, CoreResourceReader>());

    useEffect(() => {
        for (const descriptor of descriptors) {
            if (!constructedStoreCache.has(descriptor)) {
                let found = false;
                for (const [cachedDescriptor, value] of constructedStoreCache) {
                    if (isEqual(cachedDescriptor, descriptor)) {
                        constructedStoreCache.set(descriptor, value);
                        constructedStoreCache.delete(cachedDescriptor);
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    const store = EagerHttpSynchronizedStore.createFromDescriptor(descriptor, httpFetch);
                    constructedStoreCache.set(descriptor, store);
                    store.load().then(() => {
                        if ([...constructedStoreCache.values()].includes(store)) {
                            federatedObservableStore.addStore(store);
                        }
                    })
                }
            }
        }

        // Remove old stores
        for (const [descriptor, store] of constructedStoreCache) {
            if (!descriptors.includes(descriptor)) {
                constructedStoreCache.delete(descriptor);
                if (federatedObservableStore.getStores().includes(store)) {
                    federatedObservableStore.removeStore(store);
                }
            }
        }
    }, [descriptors, constructedStoreCache, federatedObservableStore]);

    const [descriptorsWrapped] = useState({descriptors});
    descriptorsWrapped.descriptors = descriptors;

    useEffect(() => {
        return () => {
            descriptorsWrapped.descriptors.forEach(descriptor => {
                const store = constructedStoreCache.get(descriptor);
                constructedStoreCache.delete(descriptor);
                if (store && federatedObservableStore.getStores().includes(store)) {
                    federatedObservableStore.removeStore(store);
                }
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [federatedObservableStore]);

    return constructedStoreCache;
};
