import {CoreResource} from "model-driven-data/core";
import React, {useCallback, useEffect, useState} from "react";
import {StoreContext} from "../components/App";
import {CoreResourceLink} from "../store/core-resource-link";
import {Subscriber} from "../store/observable-core-resource-reader-writer";

export const useResource = <ResourceType extends CoreResource>(iri: string | null) => {
    const {store} = React.useContext(StoreContext);
    const [state, setState] = useState<CoreResourceLink<ResourceType>>({
        resource: null,
        isLoading: true,
    });

    const subscriber = useCallback<Subscriber>((_, resource) => setState(resource as CoreResourceLink<ResourceType>), []);

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
