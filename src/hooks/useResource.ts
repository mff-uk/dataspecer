import {CoreResource} from "model-driven-data/core";
import React, {useCallback, useEffect, useState} from "react";
import {StoreContext} from "../components/App";
import {CoreResourceLink} from "../store/core-resource-link";
import {Subscriber} from "../store/federated-observable-store";

export const useResource = <ResourceType extends CoreResource>(iri: string | null) => {
    const {store} = React.useContext(StoreContext);
    const [state, setState] = useState<CoreResourceLink<ResourceType>>(() => {
        if (iri) {
            const cached = store.optimizeGetCachedValue(iri) as CoreResourceLink<ResourceType>;
            if (cached) {
                return cached;
            }
        }

        return {
            resource: null,
            isLoading: true,
        }
    });

    const [stateInjector] = useState({state});
    stateInjector.state = state;

    const subscriber = useCallback<Subscriber>((_, resource) => {
        const state = stateInjector.state;
        if (resource.resource === state.resource && resource.isLoading === state.isLoading) {
            return;
        }
        setState(resource as CoreResourceLink<ResourceType>);
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
            });
        }
    }, [iri, store]);

    return state;
}
