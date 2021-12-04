import React, {ReactElement} from "react";
import {Box, Typography} from "@mui/material";
import {MemoryOutputStream} from "model-driven-data/io/stream/memory-output-stream";
import {CoreResourceReader} from "model-driven-data/core";
import {writeJsonSchema} from "model-driven-data/json-schema/json-schema-writer";
import {githubGist} from "react-syntax-highlighter/dist/esm/styles/hljs";
import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import {coreResourcesToStructuralModel} from "model-driven-data/structure-model";
import {structureModelToJsonSchema} from "model-driven-data/json-schema/json-schema-model-adapter";

SyntaxHighlighter.registerLanguage("json", json);
async function generate(reader: CoreResourceReader, fromSchema: string): Promise<string> {
    const structureModel = await coreResourcesToStructuralModel(reader, fromSchema);
    if (structureModel === null) {
        throw new Error("Empty structural model.");
    }

    const jsonSchema = structureModelToJsonSchema(structureModel);
    const stream = new MemoryOutputStream();
    await writeJsonSchema(jsonSchema, stream);
    return stream.getContent();
}

export async function GetJsonSchemaArtifact(reader: CoreResourceReader, schema: string): Promise<string> {
    const jsonSchema = await generate(reader, schema);
    if (!jsonSchema) {
        throw new Error("No schema returned");
    }
    return jsonSchema;
}

export async function GetPreviewComponentJsonSchemaArtifact(reader: CoreResourceReader, schema: string): Promise<ReactElement> {
    const jsonSchema = await generate(reader, schema);
    if (!jsonSchema) {
        throw new Error("No schema returned");
    }
    return <Box sx={{whiteSpace: "pre"}}>
        <Typography variant="h5" sx={{mb: 2}}>JSON Schema</Typography>
        <SyntaxHighlighter language="json" style={githubGist}>{JSON.stringify(JSON.parse(jsonSchema), null, 2)}</SyntaxHighlighter>
    </Box>;
}
