import React, {ReactElement} from "react";
import {Box, Typography} from "@mui/material";
import {CoreResource, CoreResourceReader} from "@model-driven-data/core/lib/core";
import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import {githubGist} from "react-syntax-highlighter/dist/esm/styles/hljs";

SyntaxHighlighter.registerLanguage("json", json);

const ResourceArtifact: React.FC<{resource: CoreResource}> = ({resource}) => <>
    <Typography variant="h6" sx={{mt: 2}}>{resource.iri}</Typography>
    <SyntaxHighlighter language="json" style={githubGist}>{JSON.stringify(resource, null, 2)}</SyntaxHighlighter>
</>;

export async function GetPreviewComponentStoreArtifact(reader: CoreResourceReader): Promise<ReactElement> {
    const resourcesIri = await reader.listResources();
    const resources = await Promise.all(resourcesIri.map(iri => reader.readResource(iri)));

    return <Box>
        <Typography variant="h5" sx={{mb: 2}}>Store</Typography>
        {resources.filter((resource => resource !== null) as (r: CoreResource | null) => r is CoreResource).map(resource => <ResourceArtifact resource={resource} />)}
    </Box>;
}

export async function GetStoreArtifact(reader: CoreResourceReader): Promise<string> {
    const resourcesIri = await reader.listResources();
    const resources = await Promise.all(resourcesIri.map(iri => reader.readResource(iri))) as CoreResource[];
    const obj = Object.fromEntries(resources.map(r => [r.iri, r]));
    return JSON.stringify(obj, null, 2);
}
