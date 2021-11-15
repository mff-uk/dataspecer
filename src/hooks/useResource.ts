import {CoreResource} from "model-driven-data/core";
import React, {useCallback, useEffect, useState} from "react";
import {StoreContext} from "../components/App";
import {CoreResourceLink} from "../store/core-resource-link";
import {StoreWithMetadata, Subscriber} from "../store/federated-observable-store";

export const useResource = <ResourceType extends CoreResource>(iri: string | null) => {
    const {store} = React.useContext(StoreContext);
    const [state, setState] = useState<CoreResourceLink<ResourceType> & {store: StoreWithMetadata | null}>(() => {
        if (iri) {
            const cached = store.optimizeGetCachedValue(iri) as CoreResourceLink<ResourceType>;
            if (cached) {
                return {
                    ...cached,
                    store: store.optimizeGetOriginatedStore(iri),
                };
            }
        }

        return {
            resource: null,
            isLoading: true,
            store: null,
        }
    });

    const [stateInjector] = useState({state});
    stateInjector.state = state;

    const subscriber = useCallback<Subscriber>((_, resource, store) => {
        const state = stateInjector.state;
        if (resource.resource === state.resource && resource.isLoading === state.isLoading && store === state.store) {
            return;
        }
        setState({
            ...(resource as CoreResourceLink<ResourceType>),
            store
        });
    }, []);

    useEffect(() => {
        if (iri) {
            const oldStore = store;
            store.addSubscriber(iri, subscriber);
            return () => oldStore.removeSubscriber(iri, subscriber);
        } else {
            setState({
                resource: null,
                isLoading: false,
                store: null,
            });
        }
    }, [iri, store]);

    return state;
}
