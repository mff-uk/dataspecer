import {DataPsmSchema} from "@model-driven-data/core/data-psm/model";
import {useResource} from "@model-driven-data/federated-observable-store-react/use-resource";
import {Skeleton, Typography} from "@mui/material";
import React, {useContext} from "react";
import {PimSchema} from "@model-driven-data/core/pim/model";
import {DataSpecificationsContext} from "./app";
import {LanguageString} from "@model-driven-data/core/core";

export function selectLanguage(input: LanguageString, languages: readonly string[]): string | undefined {
    for (const language of languages) {
        if (input[language]) {
            return input[language];
        }
    }

    // noinspection LoopStatementThatDoesntLoopJS
    for (const language in input) {
        return input[language];
    }

    return undefined;
}

export const DataSpecificationNameCell: React.FC<{
    dataSpecificationIri: string,
}> = ({dataSpecificationIri}) => {
    const {dataSpecifications} = useContext(DataSpecificationsContext);
    const specification = dataSpecifications[dataSpecificationIri];

    const {resource, isLoading} = useResource<PimSchema>(specification?.pim ?? null);

    return (
        <Typography sx={{fontWeight: "bold"}}>
            {!resource || isLoading ? <Skeleton /> : (selectLanguage(resource.pimHumanLabel ?? {}, ["en"]) ?? "-")}
        </Typography>
    );
};

export const DataSchemaNameCell: React.FC<{
    dataPsmSchemaIri: string,
}> = ({dataPsmSchemaIri}) => {
    const {resource, isLoading} = useResource<DataPsmSchema>(dataPsmSchemaIri);

    return (
        <Typography sx={{fontWeight: "bold"}}>
            {!resource || isLoading ? <Skeleton /> : (selectLanguage(resource.dataPsmHumanLabel ?? {}, ["en"]) ?? "-")}
        </Typography>
    );
};
