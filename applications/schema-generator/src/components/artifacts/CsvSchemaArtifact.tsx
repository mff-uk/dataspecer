import React, {ReactElement} from "react";
import {Box, Typography} from "@mui/material";
import {githubGist} from "react-syntax-highlighter/dist/esm/styles/hljs";
import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import {CSV_SCHEMA} from "@model-driven-data/core/csv-schema/csv-schema-vocabulary";
import {DataSpecificationSchema} from "@model-driven-data/core/data-specification/model";
import {Configuration} from "../../configuration/configuration";
import {getSingleArtifact} from "./get-single-artifact";

SyntaxHighlighter.registerLanguage("json", json);

async function generate(configuration: Configuration): Promise<string|null> {
    if (configuration.dataSpecificationIri) {
        return await getSingleArtifact(
            configuration.store,
            configuration.dataSpecificationIri,
            configuration.dataSpecifications,
            artefact =>
                artefact.generator === CSV_SCHEMA.Generator &&
                DataSpecificationSchema.is(artefact) &&
                artefact.psm === configuration.dataPsmSchemaIri,
        );
    }

    return null;
}

export async function GetCsvSchemaArtifact(configuration: Configuration): Promise<string> {
    const csvSchema = await generate(configuration);
    if (!csvSchema) {
        throw new Error("No schema returned");
    }
    return csvSchema;
}

export async function GetPreviewComponentCsvSchemaArtifact(configuration: Configuration): Promise<ReactElement> {
    const csvSchema = await generate(configuration);
    if (!csvSchema) {
        throw new Error("No schema returned");
    }
    return <Box sx={{whiteSpace: "pre"}}>
        <Typography variant="h5" sx={{mb: 2}}>CSV Schema</Typography>
        <SyntaxHighlighter language="json" style={githubGist}>{csvSchema}</SyntaxHighlighter>
    </Box>;
}
