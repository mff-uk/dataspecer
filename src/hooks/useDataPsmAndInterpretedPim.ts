import React from "react";
import {StoreContext} from "../components/App";
import {useResourceFromModel} from "./useResourceFromModel";
import {DataPsmResource} from "model-driven-data/data-psm/model";
import {PimResource} from "model-driven-data/pim/model";

/**
 * For the given data-PSM IRI it returns {@link DataPsmResource} object along with {@link PimResource} object if
 * interpreted.
 * @param dataPsmResourceIri IRI of data-PSM resource
 */
export const useDataPsmAndInterpretedPim = <DataPsmResourceType extends DataPsmResource, PimResourceType extends PimResource>(dataPsmResourceIri: string | null) => {
    const {models} = React.useContext(StoreContext);
    const dataPsmResource = useResourceFromModel<DataPsmResourceType>(dataPsmResourceIri, models.dataPsm);
    const pimResource = useResourceFromModel<PimResourceType>(dataPsmResource.resource?.dataPsmInterpretation ?? null, models.pim);

    return {
        dataPsmResource: dataPsmResource.resource,
        pimResource: pimResource.resource,
        isLoading: dataPsmResource.isLoading || pimResource.isLoading,
        isError: dataPsmResource.isError || pimResource.isError,
    };
}
