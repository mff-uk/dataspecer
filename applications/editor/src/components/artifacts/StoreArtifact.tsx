import React, {ReactElement} from "react";
import {Box, Typography} from "@mui/material";
import {CoreResource} from "@dataspecer/core/core";
import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import {githubGist} from "react-syntax-highlighter/dist/esm/styles/hljs";
import {Configuration} from "../../configuration/configuration";

SyntaxHighlighter.registerLanguage("json", json);

const ResourceArtifact: React.FC<{resource: CoreResource}> = ({resource}) => <>
    <Typography variant="h6" sx={{mt: 2}}>{resource.iri}</Typography>
    <SyntaxHighlighter language="json" style={githubGist}>{JSON.stringify(resource, null, 2)}</SyntaxHighlighter>
</>;

export async function GetPreviewComponentStoreArtifact(configuration: Configuration): Promise<ReactElement> {
    const resourcesIri = await configuration.store.listResources();
    const resources = await Promise.all(resourcesIri.map(iri => configuration.store.readResource(iri)));

    return <Box>
        <Typography variant="h5" sx={{mb: 2}}>Store</Typography>
        {resources.filter((resource => resource !== null) as (r: CoreResource | null) => r is CoreResource).map(resource => <ResourceArtifact resource={resource} />)}
    </Box>;
}

export async function GetStoreArtifact(configuration: Configuration): Promise<string> {
    const resourcesIri = await configuration.store.listResources();
    const resources = await Promise.all(resourcesIri.map(iri => configuration.store.readResource(iri))) as CoreResource[];
    const obj = Object.fromEntries(resources.map(r => [r.iri, r]));
    return JSON.stringify(obj, null, 2);
}
