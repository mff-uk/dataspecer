import React, {memo, ReactElement, useMemo} from "react";
import {LanguageStringUndefineable} from "../../helper/LanguageStringComponents";
import {LanguageString} from "@dataspecer/core/core";
import {useDataPsmAndInterpretedPim} from "../../../hooks/use-data-psm-and-interpreted-pim";
import { DataPsmResource } from "@dataspecer/core/data-psm/model/data-psm-resource";
import { isSemanticModelRelationship, NamedThing, SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";

export const DataPsmGetLabelAndDescription: React.FC<{dataPsmResourceIri: string, children: (label?: string, description?: string) => ReactElement}> = memo(({dataPsmResourceIri, children}) => {
    const {dataPsmResource, pimResource} = useDataPsmAndInterpretedPim<DataPsmResource, SemanticModelEntity & NamedThing>(dataPsmResourceIri);

    // todo: resolve backward relations.
    const name = (isSemanticModelRelationship(pimResource) ? pimResource.ends[1].name : undefined) ?? pimResource?.name;
    const description = (isSemanticModelRelationship(pimResource) ? pimResource.ends[1].description : undefined) ?? pimResource?.description;

    const labels = useMemo<LanguageString>(() => ({...name, ...dataPsmResource?.dataPsmHumanLabel}), [dataPsmResource?.dataPsmHumanLabel, name]);
    const descriptions = useMemo<LanguageString>(() => ({...description, ...dataPsmResource?.dataPsmHumanDescription}), [dataPsmResource?.dataPsmHumanDescription, description]);

    return <LanguageStringUndefineable from={labels}>
        {label =>
            <LanguageStringUndefineable from={descriptions}>
                {description =>
                    children(label, description)
                }
            </LanguageStringUndefineable>
        }
    </LanguageStringUndefineable>;
});
