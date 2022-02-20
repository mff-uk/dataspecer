import React, {ReactElement} from "react";
import {Box, Typography} from "@mui/material";
import {CoreResourceReader} from "@model-driven-data/core/core";
import {githubGist} from "react-syntax-highlighter/dist/esm/styles/hljs";
import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import {FederatedObservableStore} from "../../store/federated-observable-store";
import {CSV_SCHEMA} from "@model-driven-data/core/csv-schema/csv-schema-vocabulary";
import {DataSpecificationSchema} from "@model-driven-data/core/data-specification/model";
import {getGeneratedArtifactFromRoot} from "./artifact-generator";

SyntaxHighlighter.registerLanguage("json", json);

async function generate(reader: CoreResourceReader, fromSchema: string): Promise<string> {
    return await getGeneratedArtifactFromRoot(
        reader as FederatedObservableStore,
        artefact =>
            artefact.generator === CSV_SCHEMA.Generator &&
            DataSpecificationSchema.is(artefact) &&
            artefact.psm === fromSchema
    );
}

export async function GetCsvSchemaArtifact(reader: CoreResourceReader, schema: string): Promise<string> {
    const csvSchema = await generate(reader, schema);
    if (!csvSchema) {
        throw new Error("No schema returned");
    }
    return csvSchema;
}

export async function GetPreviewComponentCsvSchemaArtifact(reader: CoreResourceReader, schema: string): Promise<ReactElement> {
    const csvSchema = await generate(reader, schema);
    if (!csvSchema) {
        throw new Error("No schema returned");
    }
    return <Box sx={{whiteSpace: "pre"}}>
        <Typography variant="h5" sx={{mb: 2}}>CSV Schema</Typography>
        <SyntaxHighlighter language="json" style={githubGist}>{csvSchema}</SyntaxHighlighter>
    </Box>;
}
