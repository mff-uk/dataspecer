import React, {ReactElement} from "react";
import {Box, Typography} from "@mui/material";
import {CoreResourceReader} from "@model-driven-data/core/core";
import {Light as SyntaxHighlighter} from 'react-syntax-highlighter';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import {githubGist} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {FederatedObservableStore} from "../../store/federated-observable-store";
import {XSLT_LIFTING, XSLT_LOWERING} from "@model-driven-data/core/xml-transformations/xslt-vocabulary";
import {DataSpecificationSchema} from "@model-driven-data/core/data-specification/model";
import {getGeneratedArtifactFromRoot} from "./artifact-generator";

SyntaxHighlighter.registerLanguage("xml", xml);

async function generate(reader: CoreResourceReader, fromSchema: string, isLifting: boolean): Promise<string> {
    return await getGeneratedArtifactFromRoot(
        reader as FederatedObservableStore,
        artefact =>
            artefact.generator === (isLifting ? XSLT_LIFTING.Generator : XSLT_LOWERING.Generator) &&
            DataSpecificationSchema.is(artefact) &&
            artefact.psm === fromSchema,
    );
}

async function GetXsltArtifact(reader: CoreResourceReader, schema: string, isLifting: boolean): Promise<string> {
    const xslt = await generate(reader, schema, isLifting);
    if (!xslt) {
        throw new Error("No schema returned");
    }
    return xslt;
}

async function GetPreviewComponentXsltArtifact(reader: CoreResourceReader, schema: string, isLifting: boolean): Promise<ReactElement> {
    const xslt = await generate(reader, schema, isLifting);
    if (!xslt) {
        throw new Error("No schema returned");
    }
    return <Box>
        <Typography variant="h5" sx={{mb: 2}}>XSL {isLifting ? "Lifting" : "Lowering"} Transformation</Typography>
        <SyntaxHighlighter language="xml" style={githubGist}>{xslt}</SyntaxHighlighter>
    </Box>;
}

export async function GetXsltLiftingArtifact(reader: CoreResourceReader, schema: string): Promise<string> {
    return GetXsltArtifact(reader, schema, true);
}

export async function GetXsltLoweringArtifact(reader: CoreResourceReader, schema: string): Promise<string> {
    return GetXsltArtifact(reader, schema, false);
}

export async function GetPreviewComponentXsltLiftingArtifact(reader: CoreResourceReader, schema: string): Promise<ReactElement> {
    return GetPreviewComponentXsltArtifact(reader, schema, true);
}

export async function GetPreviewComponentXsltLoweringArtifact(reader: CoreResourceReader, schema: string): Promise<ReactElement> {
    return GetPreviewComponentXsltArtifact(reader, schema, false);
}
