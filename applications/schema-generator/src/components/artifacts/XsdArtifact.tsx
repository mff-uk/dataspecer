import React, {ReactElement} from "react";
import {Box, Typography} from "@mui/material";
import {Light as SyntaxHighlighter} from 'react-syntax-highlighter';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import {githubGist} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {XML_SCHEMA} from "@dataspecer/core/xml-schema/xml-schema-vocabulary";
import {DataSpecificationSchema} from "@dataspecer/core/data-specification/model";
import {getSingleArtifact} from "./get-single-artifact";
import {Configuration} from "../../configuration/configuration";

SyntaxHighlighter.registerLanguage("xml", xml);

async function generate(configuration: Configuration): Promise<string|null> {
    if (configuration.dataSpecificationIri) {
        return await getSingleArtifact(
            configuration.store,
            configuration.dataSpecificationIri,
            configuration.dataSpecifications,
            artefact =>
                artefact.generator === XML_SCHEMA.Generator &&
                DataSpecificationSchema.is(artefact) &&
                artefact.psm === configuration.dataPsmSchemaIri,
        );
    }

    return null;
}

export async function GetXsdArtifact(configuration: Configuration): Promise<string> {
    const xsd = await generate(configuration);
    if (!xsd) {
        throw new Error("No schema returned");
    }
    return xsd;
}

export async function GetPreviewComponentXsdArtifact(configuration: Configuration): Promise<ReactElement> {
    const xsd = await generate(configuration);
    if (!xsd) {
        throw new Error("No schema returned");
    }
    return <Box>
        <Typography variant="h5" sx={{mb: 2}}>XSD Schema</Typography>
        <SyntaxHighlighter language="xml" style={githubGist}>{xsd}</SyntaxHighlighter>
    </Box>;
}
