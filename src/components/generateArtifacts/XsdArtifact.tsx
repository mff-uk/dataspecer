import React, {ReactElement} from "react";
import {Box} from "@mui/material";
import {coreResourcesToObjectModel} from "model-driven-data/object-model";
import {MemoryOutputStream} from "model-driven-data/io/stream/memory-output-stream";
import {CoreResourceReader} from "model-driven-data/core";
import {objectModelToXmlSchema, writeXmlSchema} from "model-driven-data/xml-schema";

async function generate(reader: CoreResourceReader, fromSchema: string): Promise<string> {
    const objectModel = await coreResourcesToObjectModel(reader, fromSchema);
    const schema = objectModelToXmlSchema(objectModel);
    const stream = new MemoryOutputStream();
    await writeXmlSchema(schema, stream);
    return stream.getContent();
}

export async function GetXsdArtifact(reader: CoreResourceReader, schema: string): Promise<string> {
    const xsd = await generate(reader, schema);
    if (!xsd) {
        throw new Error("No schema returned");
    }
    return xsd;
}

export async function GetPreviewComponentXsdArtifact(reader: CoreResourceReader, schema: string): Promise<ReactElement> {
    const xsd = await generate(reader, schema);
    if (!xsd) {
        throw new Error("No schema returned");
    }
    return <Box sx={{whiteSpace: "pre"}}>
        {xsd}
    </Box>;
}
