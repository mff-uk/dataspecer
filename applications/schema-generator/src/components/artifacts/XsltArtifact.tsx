import React, {ReactElement} from "react";
import {Box, Typography} from "@mui/material";
import {Light as SyntaxHighlighter} from 'react-syntax-highlighter';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import {githubGist} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {XSLT_LIFTING, XSLT_LOWERING} from "@model-driven-data/core/xml-transformations/xslt-vocabulary";
import {DataSpecificationSchema} from "@model-driven-data/core/data-specification/model";
import {Configuration} from "../../configuration/configuration";
import {getSingleArtifact} from "./get-single-artifact";

SyntaxHighlighter.registerLanguage("xml", xml);

async function generate(configuration: Configuration, isLifting: boolean): Promise<string|null> {
    if (configuration.dataSpecificationIri) {
        return await getSingleArtifact(
            configuration.store,
            configuration.dataSpecificationIri,
            configuration.dataSpecifications,
            artefact =>
                artefact.generator === (isLifting ? XSLT_LIFTING.Generator : XSLT_LOWERING.Generator) &&
                DataSpecificationSchema.is(artefact) &&
                artefact.psm === configuration.dataPsmSchemaIri,
        );
    }

    return null;
}

async function GetXsltArtifact(configuration: Configuration, isLifting: boolean): Promise<string> {
    const xslt = await generate(configuration, isLifting);
    if (!xslt) {
        throw new Error("No schema returned");
    }
    return xslt;
}

async function GetPreviewComponentXsltArtifact(configuration: Configuration, isLifting: boolean): Promise<ReactElement> {
    const xslt = await generate(configuration, isLifting);
    if (!xslt) {
        throw new Error("No schema returned");
    }
    return <Box>
        <Typography variant="h5" sx={{mb: 2}}>XSL {isLifting ? "Lifting" : "Lowering"} Transformation</Typography>
        <SyntaxHighlighter language="xml" style={githubGist}>{xslt}</SyntaxHighlighter>
    </Box>;
}

export async function GetXsltLiftingArtifact(configuration: Configuration): Promise<string> {
    return GetXsltArtifact(configuration, true);
}

export async function GetXsltLoweringArtifact(configuration: Configuration): Promise<string> {
    return GetXsltArtifact(configuration, false);
}

export async function GetPreviewComponentXsltLiftingArtifact(configuration: Configuration): Promise<ReactElement> {
    return GetPreviewComponentXsltArtifact(configuration, true);
}

export async function GetPreviewComponentXsltLoweringArtifact(configuration: Configuration): Promise<ReactElement> {
    return GetPreviewComponentXsltArtifact(configuration, false);
}
