import React, {ReactElement} from "react";
import {StoreContext} from "../../App";
import {PsmBase, PimBase} from "model-driven-data";
import {LanguageStringUndefineable} from "../../helper/LanguageStringComponents";

export const GetLabelAndDescription: React.FC<{id: string, children: (label?: string, description?: string) => ReactElement}> = ({id, children}) => {
    const {store} = React.useContext(StoreContext);

    const psm = store[id] as PsmBase;
    const pim = psm.psmInterpretation ? store[psm.psmInterpretation] as PimBase : undefined;

    // todo: This implementation is temporary

    const labels = {...pim?.pimHumanLabel, ...psm?.psmHumanLabel};
    const descriptions = {...pim?.pimHumanDescription, ...psm?.psmHumanDescription};

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
