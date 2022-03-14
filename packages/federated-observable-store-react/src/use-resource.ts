import {CoreResource} from "@model-driven-data/core/core";
import {useCallback, useContext, useEffect, useState} from "react";
import {StoreContext} from "./store-context";
import {Resource} from "@model-driven-data/federated-observable-store/resource";
import {Subscriber} from "@model-driven-data/federated-observable-store/federated-observable-store";

const loadingEmptyLink = {
    resource: null,
    isLoading: true, // The whole idea is that if IRI is null, that means that some other resource is being loaded, therefore transitively also this resource is loading
}

export const useResource = <ResourceType extends CoreResource>(iri: string | null) => {
    const store = useContext(StoreContext);
    const [state, setState] = useState<Resource<ResourceType>>(() => {
        if (iri) {
            return store.getBeforeSubscription<ResourceType>(iri);
        }

        return loadingEmptyLink;
    });

    const subscriber = useCallback<Subscriber>((_, resource) => {
        setState(resource as Resource<ResourceType>);
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
