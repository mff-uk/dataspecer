import {DataPsmResource} from "@model-driven-data/core/lib/data-psm/model";
import {PimResource} from "@model-driven-data/core/lib/pim/model";
import {useResource} from "./useResource";

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
        dataPsmResourceStore: dataPsmResource.store,
        pimResource: pimResource.resource,
        pimResourceStore: pimResource.store,
        isLoading: dataPsmResource.isLoading || pimResource.isLoading,
    };
}
