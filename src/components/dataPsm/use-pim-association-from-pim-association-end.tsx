// todo This hook is just temporary until we fix problem with accessing the association from its association end.
import React from "react";
import {StoreContext} from "../App";
import {useAsyncMemo} from "../../hooks/useAsyncMemo";
import {PimAssociation} from "model-driven-data/pim/model";
import {CoreResourceLink} from "../../store/core-resource-link";

export const usePimAssociationFromPimAssociationEnd = (pimAssociationEndIri: string | null): CoreResourceLink<PimAssociation> => {
    const {store} = React.useContext(StoreContext);

    const [resource, isLoading] = useAsyncMemo<PimAssociation | null>(async () => {
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

    return {
        resource: resource ?? null,
        isLoading,
    }
}
