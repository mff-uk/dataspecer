import { SemanticModelEntity, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { DataPsmAssociationEnd, DataPsmResource } from "@dataspecer/core/data-psm/model";
import { useResource } from "@dataspecer/federated-observable-store-react/use-resource";

/**
 * For the given data-PSM IRI it returns {@link DataPsmResource} object along with {@link SemanticModelEntity} object if
 * interpreted.
 * @param dataPsmResourceIri IRI of data-PSM resource
 */
export const useDataPsmAndInterpretedPim = <DataPsmResourceType extends DataPsmResource, PimResourceType extends SemanticModelEntity>(dataPsmResourceIri: string | null) => {
    const dataPsmResource = useResource<DataPsmResourceType>(dataPsmResourceIri);
    const pimResource = useResource<PimResourceType>(dataPsmResource.resource?.dataPsmInterpretation ?? null);

    return {
        dataPsmResource: dataPsmResource.resource,
        pimResource: pimResource.resource,
        isLoading: dataPsmResource.isLoading || pimResource.isLoading,
        relationshipEnd: (pimResource.resource && isSemanticModelRelationship(pimResource.resource)) ? pimResource.resource.ends[(dataPsmResource.resource as unknown as DataPsmAssociationEnd).dataPsmIsReverse === true ? 0 : 1] : null,
    };
}
