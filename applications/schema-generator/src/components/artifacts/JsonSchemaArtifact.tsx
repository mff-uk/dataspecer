import React, {ReactElement} from "react";
import {Box, Typography} from "@mui/material";
import {githubGist} from "react-syntax-highlighter/dist/esm/styles/hljs";
import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import {JSON_SCHEMA} from "@dataspecer/core/json-schema/json-schema-vocabulary";
import {DataSpecificationSchema} from "@dataspecer/core/data-specification/model";
import {getSingleArtifact} from "./get-single-artifact";
import {Configuration} from "../../configuration/configuration";

SyntaxHighlighter.registerLanguage("json", json);

async function generate(configuration: Configuration): Promise<string|null> {
    if (configuration.dataSpecificationIri) {
        return await getSingleArtifact(
            configuration.store,
            configuration.dataSpecificationIri,
            configuration.dataSpecifications,
            artefact =>
                artefact.generator === JSON_SCHEMA.Generator &&
                DataSpecificationSchema.is(artefact) &&
                artefact.psm === configuration.dataPsmSchemaIri,
        );
    }

    return null;
}

export async function GetJsonSchemaArtifact(configuration: Configuration): Promise<string> {
    const jsonSchema = await generate(configuration);
    if (!jsonSchema) {
        throw new Error("No schema returned");
    }
    return jsonSchema;
}

export async function GetPreviewComponentJsonSchemaArtifact(configuration: Configuration): Promise<ReactElement> {
    const jsonSchema = await generate(configuration);
    if (!jsonSchema) {
        throw new Error("No schema returned");
    }
    return <Box sx={{whiteSpace: "pre"}}>
        <Typography variant="h5" sx={{mb: 2}}>JSON Schema</Typography>
        <SyntaxHighlighter language="json" style={githubGist}>{JSON.stringify(JSON.parse(jsonSchema), null, 2)}</SyntaxHighlighter>
    </Box>;
}
