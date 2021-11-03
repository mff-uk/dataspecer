import React, {ReactElement} from "react";
import {Box, Typography} from "@mui/material";
import {coreResourcesToObjectModel, defaultStringSelector} from "model-driven-data/object-model";
import {MemoryOutputStream} from "model-driven-data/io/stream/memory-output-stream";
import {CoreResourceReader} from "model-driven-data/core";
import {objectModelToJsonSchema} from "model-driven-data/json-schema/json-schema-model-adapter";
import {writeJsonSchema} from "model-driven-data/json-schema/json-schema-writer";

async function generate(reader: CoreResourceReader, fromSchema: string): Promise<string> {
    const objectModel = await coreResourcesToObjectModel(reader, fromSchema);
    const jsonSchema = objectModelToJsonSchema(objectModel, defaultStringSelector);
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
        {JSON.stringify(JSON.parse(jsonSchema), null, 4)}
    </Box>;
}
