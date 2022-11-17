import {DataPsmResource} from "@dataspecer/core/data-psm/model";
import {PimResource} from "@dataspecer/core/pim/model";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";

/**
 * For the given data-PSM IRI it returns {@link DataPsmResource} object along with {@link PimResource} object if
 * interpreted.
 * @param dataPsmResourceIri IRI of data-PSM resource
 */
export const useDataPsmAndInterpretedPim = <DataPsmResourceType extends DataPsmResource, PimResourceType extends PimResource>(dataPsmResourceIri: string | null) => {
    const dataPsmResource = useResource<DataPsmResourceType>(dataPsmResourceIri);
    const pimResource = useResource<PimResourceType>(dataPsmResource.resource?.dataPsmInterpretation ?? null);

    return {
        dataPsmResource: dataPsmResource.resource,
        pimResource: pimResource.resource,
        isLoading: dataPsmResource.isLoading || pimResource.isLoading,
    };
}
