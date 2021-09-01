import React from "react";
import {StoreContext} from "../components/App";
import {useResourceFromModel} from "./useResourceFromModel";
import {DataPsmResource} from "model-driven-data/data-psm/model";

/**
 * For the given data-PSM IRI it returns {@link DataPsmResource} object.
 * @param dataPsmResourceIri IRI of data-PSM resource
 */
export const useDataPsm = <DataPsmResourceType extends DataPsmResource>(dataPsmResourceIri: string) => {
    const {models} = React.useContext(StoreContext);
    const dataPsmResource = useResourceFromModel<DataPsmResourceType>(dataPsmResourceIri, models.dataPsm);

    return {
        dataPsmResource: dataPsmResource.resource,
        isLoading: dataPsmResource.isLoading,
        isError: dataPsmResource.isError,
    };
}
