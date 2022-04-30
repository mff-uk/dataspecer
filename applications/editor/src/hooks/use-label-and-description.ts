import {useMemo} from "react";
import {PimResource} from "@dataspecer/core/pim/model";
import {DataPsmResource} from "@dataspecer/core/data-psm/model";

export const useLabelAndDescription = (dataPsmResource?: DataPsmResource | null, pimResource?: PimResource | null) => {
    return useMemo(() => {
        return [
            {...pimResource?.pimHumanLabel, ...dataPsmResource?.dataPsmHumanLabel},
            {...pimResource?.pimHumanDescription, ...dataPsmResource?.dataPsmHumanDescription},
        ]
    }, [pimResource?.pimHumanLabel, dataPsmResource?.dataPsmHumanLabel, pimResource?.pimHumanDescription, dataPsmResource?.dataPsmHumanDescription]);
}
