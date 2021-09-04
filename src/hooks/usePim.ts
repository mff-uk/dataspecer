import React from "react";
import {StoreContext} from "../components/App";
import {useResourceFromModel} from "./useResourceFromModel";
import {PimResource} from "model-driven-data/pim/model";

/**
 * For the given PIM IRI it returns {@link PimResource} object.
 * @param pimResourceIri IRI of PIM resource
 */
export const usePim = <PimResourceType extends PimResource>(pimResourceIri: string | null) => {
    const {models} = React.useContext(StoreContext);
    const pimResource = useResourceFromModel<PimResourceType>(pimResourceIri ?? null, models.pim);

    return {
        pimResource: pimResource.resource,
        isLoading: pimResource.isLoading,
        isError: pimResource.isError,
    };
}
