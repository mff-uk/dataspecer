import React, {ReactElement} from "react";
import {Box, Typography} from "@mui/material";
import {CoreResourceReader} from "@model-driven-data/core/core";
import {Light as SyntaxHighlighter} from 'react-syntax-highlighter';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import {githubGist} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {FederatedObservableStore} from "../../store/federated-observable-store";
import {XML_SCHEMA} from "@model-driven-data/core/xml-schema/xml-schema-vocabulary";
import {DataSpecificationSchema} from "@model-driven-data/core/data-specification/model";
import {getGeneratedArtifactFromRoot} from "./artifact-generator";

SyntaxHighlighter.registerLanguage("xml", xml);

async function generate(reader: CoreResourceReader, fromSchema: string): Promise<string> {
    return await getGeneratedArtifactFromRoot(
        reader as FederatedObservableStore,
        artefact =>
            artefact.generator === XML_SCHEMA.Generator &&
            DataSpecificationSchema.is(artefact) &&
            artefact.psm === fromSchema,
    );
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
