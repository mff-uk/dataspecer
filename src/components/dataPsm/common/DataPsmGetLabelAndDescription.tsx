import React, {ReactElement, useMemo} from "react";
import {LanguageStringUndefineable} from "../../helper/LanguageStringComponents";
import {LanguageString} from "model-driven-data/core";
import {useDataPsmAndInterpretedPim} from "../../../hooks/useDataPsmAndInterpretedPim";

export const DataPsmGetLabelAndDescription: React.FC<{dataPsmResourceIri: string, children: (label?: string, description?: string) => ReactElement}> = ({dataPsmResourceIri, children}) => {
    const {dataPsmResource, pimResource} = useDataPsmAndInterpretedPim(dataPsmResourceIri);

    const labels = useMemo<LanguageString>(() => ({...dataPsmResource?.dataPsmHumanLabel, ...pimResource?.pimHumanLabel}), [dataPsmResource?.dataPsmHumanLabel, pimResource?.pimHumanLabel]);
    const descriptions = useMemo<LanguageString>(() => ({...dataPsmResource?.dataPsmHumanDescription, ...pimResource?.pimHumanDescription}), [dataPsmResource?.dataPsmHumanDescription, pimResource?.pimHumanDescription]);

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
