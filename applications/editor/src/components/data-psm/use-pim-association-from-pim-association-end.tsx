// todo This hook is just temporary until we fix problem with accessing the association from its association end.
import {useAsyncMemo} from "../../hooks/useAsyncMemo";
import {PimAssociation} from "@dataspecer/core/pim/model";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {Resource} from "@dataspecer/federated-observable-store/resource";

export const usePimAssociationFromPimAssociationEnd = (pimAssociationEndIri: string | null): Resource<PimAssociation> => {
    const store = useFederatedObservableStore();

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
