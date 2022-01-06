import React, {ReactElement} from "react";
import {Box, Typography} from "@mui/material";
import {MemoryOutputStream} from "@model-driven-data/core/lib/io/stream/memory-output-stream";
import {CoreResourceReader} from "@model-driven-data/core/lib/core";
import {objectModelToXmlSchema, writeXmlSchema} from "@model-driven-data/core/lib/xml-schema";
import {Light as SyntaxHighlighter} from 'react-syntax-highlighter';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import {githubGist} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {coreResourcesToStructuralModel} from "@model-driven-data/core/lib/structure-model";

SyntaxHighlighter.registerLanguage("xml", xml);

async function generate(reader: CoreResourceReader, fromSchema: string): Promise<string> {
    const structureModel = await coreResourcesToStructuralModel(reader, fromSchema);
    if (structureModel === null) {
        throw new Error("Empty structural model.");
    }


    const schema = objectModelToXmlSchema(structureModel);
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
    return <Box>
        <Typography variant="h5" sx={{mb: 2}}>XSD Schema</Typography>
        <SyntaxHighlighter language="xml" style={githubGist}>{xsd}</SyntaxHighlighter>
    </Box>;
}
