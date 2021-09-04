import React, {ReactElement, useMemo} from "react";
import {LanguageStringUndefineable} from "../../helper/LanguageStringComponents";
import {LanguageString} from "model-driven-data/core";
import {useDataPsmAndInterpretedPim} from "../../../hooks/useDataPsmAndInterpretedPim";

export const DataPsmGetLabelAndDescription: React.FC<{dataPsmResourceIri: string, children: (label?: string, description?: string) => ReactElement}> = ({dataPsmResourceIri, children}) => {
    const {dataPsmResource, pimResource} = useDataPsmAndInterpretedPim(dataPsmResourceIri);

    const labels = useMemo<LanguageString>(() => ({...pimResource?.pimHumanLabel, ...dataPsmResource?.dataPsmHumanLabel}), [dataPsmResource?.dataPsmHumanLabel, pimResource?.pimHumanLabel]);
    const descriptions = useMemo<LanguageString>(() => ({...pimResource?.pimHumanDescription, ...dataPsmResource?.dataPsmHumanDescription}), [dataPsmResource?.dataPsmHumanDescription, pimResource?.pimHumanDescription]);

    return <LanguageStringUndefineable from={labels}>
        {label =>
            <LanguageStringUndefineable from={descriptions}>
                {description =>
                    children(label, description)
                }
            </LanguageStringUndefineable>
        }
    </LanguageStringUndefineable>;
}
