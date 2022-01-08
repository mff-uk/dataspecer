import {useMemo} from "react";
import {PimResource} from "@model-driven-data/core/pim/model";
import {DataPsmResource} from "@model-driven-data/core/data-psm/model";

export const useLabelAndDescription = (dataPsmResource?: DataPsmResource | null, pimResource?: PimResource | null) => {
    return useMemo(() => {
        return [
            {...pimResource?.pimHumanLabel, ...dataPsmResource?.dataPsmHumanLabel},
            {...pimResource?.pimHumanDescription, ...dataPsmResource?.dataPsmHumanDescription},
        ]
    }, [pimResource?.pimHumanLabel, dataPsmResource?.dataPsmHumanLabel, pimResource?.pimHumanDescription, dataPsmResource?.dataPsmHumanDescription]);
}
