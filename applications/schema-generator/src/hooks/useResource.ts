import {CoreResource} from "@model-driven-data/core/lib/core";
import React, {useCallback, useEffect, useState} from "react";
import {StoreContext} from "../components/App";
import {Resource, ResourceInfo} from "../store/resource";
import {Subscriber} from "../store/federated-observable-store";

const loadingEmptyLink = {
    resource: null,
    isLoading: true, // The whole idea is that if IRI is null, that means that some other resource is being loaded, therefore transitively also this resource is loading
    store: null,
}

export const useResource = <ResourceType extends CoreResource>(iri: string | null) => {
    const {store} = React.useContext(StoreContext);
    const [state, setState] = useState<Resource<ResourceType> & ResourceInfo>(() => {
        if (iri) {
            return store.optimizePreSubscribe<ResourceType>(iri);
        }

        return loadingEmptyLink;
    });

    const subscriber = useCallback<Subscriber>((_, resource) => {
        setState(resource as Resource<ResourceType> & ResourceInfo);
    }, []);

    useEffect(() => {
        if (iri) {
            const oldStore = store;
            store.addSubscriber(iri, subscriber);
            return () => oldStore.removeSubscriber(iri, subscriber);
        } else {
            setState(loadingEmptyLink);
        }
    }, [iri, store, subscriber]);

    return state;
}
