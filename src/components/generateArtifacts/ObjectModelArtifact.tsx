import React, {ReactElement} from "react";
import {coreResourcesToObjectModel} from "model-driven-data/object-model";
import {CoreResourceReader} from "model-driven-data/core";
import {Box, Typography} from "@mui/material";
import {githubGist} from "react-syntax-highlighter/dist/esm/styles/hljs";
import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';

SyntaxHighlighter.registerLanguage("json", json);

export async function getObjectModelArtifact(reader: CoreResourceReader, schema: string) {
    return JSON.stringify(await coreResourcesToObjectModel(reader, schema), null, 4);
}

export async function GetPreviewComponentObjectModelArtifact(reader: CoreResourceReader, schema: string): Promise<ReactElement> {
    const objectModel = await getObjectModelArtifact(reader, schema);
    if (!objectModel) {
        throw new Error("No schema returned");
    }
    return <Box sx={{whiteSpace: "pre"}}>
        <Typography variant="h5" sx={{mb: 2}}>Object-model</Typography>
        <SyntaxHighlighter language="json" style={githubGist}>{JSON.stringify(JSON.parse(objectModel), null, 2)}</SyntaxHighlighter>
    </Box>;
}
