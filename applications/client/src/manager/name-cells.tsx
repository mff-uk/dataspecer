import {DataPsmSchema} from "@dataspecer/core/data-psm/model";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {Skeleton, Typography} from "@mui/material";
import React, {ReactElement, useContext} from "react";
import {PimSchema} from "@dataspecer/core/pim/model";
import {DataSpecificationsContext} from "./app";
import {LanguageString} from "@dataspecer/core/core";

export function selectLanguage(input: LanguageString, languages: readonly string[]): string | undefined {
    if (!input) {
        return undefined;
    }

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

    return children(
        specification?.label ? selectLanguage(specification.label, ["en"]) ?? null : null,
        false,
    );
}

export const DataSpecificationNameCell: React.FC<{
    dataSpecificationIri: string,
}> = ({dataSpecificationIri}) => {
    return (
        <DataSpecificationName iri={dataSpecificationIri}>
            {(label, isLoading) => <Typography fontWeight="bold">
                {isLoading ? <Skeleton /> : (label ?? dataSpecificationIri)}
            </Typography>}
        </DataSpecificationName>
    );
};

export const DataSpecificationDetailInfoCell: React.FC<{
    dataSpecificationIri: string,
}> = ({dataSpecificationIri}) => {
    const {dataSpecifications} = useContext(DataSpecificationsContext);
    const specification = dataSpecifications[dataSpecificationIri];

    return <>
        {specification.dataStructures.length} structure{specification.dataStructures.length !== 1 && "s"}
        {specification.importsDataSpecificationIds.length > 0 && <>
        , {specification.importsDataSpecificationIds.length} reuse{specification.importsDataSpecificationIds.length !== 1 && "s"}
        </>}
    </>;
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
