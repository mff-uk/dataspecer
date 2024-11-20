import {useMemo} from "react";
import { SemanticModelClass, SemanticModelRelationship, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import {DataPsmResource} from "@dataspecer/core/data-psm/model";

/**
 * Calculates correct label and description for given entity.
 */
export const useLabelAndDescription = (dataPsmResource?: DataPsmResource | null, pimResource?: SemanticModelClass | SemanticModelRelationship | null) => {
    return useMemo(() => {
        if (pimResource && isSemanticModelRelationship(pimResource)) {
            // It is a relationship

            const end = pimResource.ends[1]; // todo
            return [
                {...pimResource?.name, ...end?.name, ...dataPsmResource?.dataPsmHumanLabel},
                {...pimResource?.description, ...end?.description, ...dataPsmResource?.dataPsmHumanDescription},
            ]
        } else {
            // It is a class
            return [
                {...pimResource?.name, ...dataPsmResource?.dataPsmHumanLabel},
                {...pimResource?.description, ...dataPsmResource?.dataPsmHumanDescription},
            ]
        }
    }, [dataPsmResource, pimResource]);
}
