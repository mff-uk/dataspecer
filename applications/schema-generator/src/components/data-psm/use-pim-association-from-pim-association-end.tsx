// todo This hook is just temporary until we fix problem with accessing the association from its association end.
import React from "react";
import {StoreContext} from "../App";
import {useAsyncMemo} from "../../hooks/useAsyncMemo";
import {PimAssociation} from "@model-driven-data/core/lib/pim/model";
import {Resource, ResourceInfo} from "../../store/resource";
import {useResource} from "../../hooks/useResource";

export const usePimAssociationFromPimAssociationEnd = (pimAssociationEndIri: string | null): Resource<PimAssociation> & ResourceInfo => {
    const {store} = React.useContext(StoreContext);

    const [resource] = useAsyncMemo<PimAssociation | null>(async () => {
        if (pimAssociationEndIri) {
            const resources = await store.listResources();
            for (const resourceIri of resources) {
                const resource = await store.readResource(resourceIri);
                if (PimAssociation.is(resource)) {
                    if (resource.pimEnd.includes(pimAssociationEndIri)) {
                        return resource;
                    }
                }
            }
        }
        return null;
    }, [pimAssociationEndIri]);

    return useResource<PimAssociation>(resource?.iri ?? null);
}
