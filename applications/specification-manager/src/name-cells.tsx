import {DataPsmSchema} from "@model-driven-data/core/data-psm/model";
import {useResource} from "@model-driven-data/federated-observable-store-react/use-resource";
import {Skeleton, Typography} from "@mui/material";
import React, {ReactElement, useContext} from "react";
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

export const DataSpecificationName: React.FC<{
    iri: string,
    children: (label: string|null, isLoading: boolean) => ReactElement,
}> = ({iri, children}) => {
    const {dataSpecifications} = useContext(DataSpecificationsContext);
    const specification = dataSpecifications[iri];
    const {resource, isLoading} = useResource<PimSchema>(specification?.pim);

    return children(
        resource?.pimHumanLabel ? selectLanguage(resource.pimHumanLabel, ["en"]) ?? null : null,
        specification && isLoading,
    );
}

export const DataSpecificationNameCell: React.FC<{
    dataSpecificationIri: string,
}> = ({dataSpecificationIri}) => {
    return (
        <DataSpecificationName iri={dataSpecificationIri}>
            {(label, isLoading) => <Typography sx={{fontWeight: "bold"}}>
                {isLoading ? <Skeleton /> : (label ?? dataSpecificationIri)}
            </Typography>}
        </DataSpecificationName>
    );
};

export const DataSchemaNameCell: React.FC<{
    dataPsmSchemaIri: string,
}> = ({dataPsmSchemaIri}) => {
    const {resource, isLoading} = useResource<DataPsmSchema>(dataPsmSchemaIri);

    return (
        <Typography sx={{fontWeight: "bold"}}>
            {!resource || isLoading ? <Skeleton /> : (selectLanguage(resource.dataPsmHumanLabel ?? {}, ["en"]) ?? dataPsmSchemaIri)}
        </Typography>
    );
};
