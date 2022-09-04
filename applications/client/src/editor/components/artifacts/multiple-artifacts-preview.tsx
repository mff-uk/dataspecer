import React from "react";
import {Alert, Box, Container, Fab, Paper, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import CloseIcon from '@mui/icons-material/Close';
import {useSingleGeneratedFileArtifact} from "./use-single-generated-file-artifact";
import {Light as SyntaxHighlighter, PrismLight as PrismSyntaxHighlighter} from "react-syntax-highlighter";
import {githubGist} from "react-syntax-highlighter/dist/esm/styles/hljs";
import {coy} from "react-syntax-highlighter/dist/esm/styles/prism";
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import sparql from 'react-syntax-highlighter/dist/esm/languages/prism/sparql';

SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("jsonld", json);
SyntaxHighlighter.registerLanguage("xml", xml);
SyntaxHighlighter.registerLanguage("xsd", xml);
SyntaxHighlighter.registerLanguage("xslt", xml);
PrismSyntaxHighlighter.registerLanguage("sparql", sparql);

/**
 * Component that renders single artifact result by generator id.
 */
export const SingleArtifactPreview: React.FC<{
    generatorIdentifier: string,
}> = ({generatorIdentifier}) => {
    const {t} = useTranslation("artifacts");

    const [result] = useSingleGeneratedFileArtifact(generatorIdentifier);
    if (!result) {
        return <Alert severity="error"><strong>{t("error")}</strong></Alert>;
    }
    let [data, filename] = result;
    const extension = filename.split(".").pop() as string;
    if (extension === "json") {
        data = JSON.stringify(JSON.parse(data), null, 2);
    }

    return <Box sx={{whiteSpace: "pre"}}>
        <Typography variant="h5" sx={{mb: 2}}>{filename}</Typography>
        {["sparql"].includes(extension) ?
          <PrismSyntaxHighlighter language={extension} style={coy}>{data}</PrismSyntaxHighlighter>
        :
          <SyntaxHighlighter language={extension} style={githubGist}>{data}</SyntaxHighlighter>
        }
    </Box>
}

/**
 * Previews a generated artifact content in a dialog.
 * @param artifactPreview
 * @param setArtifactPreview
 * @constructor
 */
export const MultipleArtifactsPreview: React.FC<{
    artifactPreview: string[],
    setArtifactPreview: (value: string[]) => void,
}> = ({artifactPreview, setArtifactPreview}) => {
    const {t} = useTranslation("ui");
    if (artifactPreview.length === 0) {
        return null;
    }
    return <Container>
        {artifactPreview.map(generatorId =>
            <Paper style={{padding: "1rem", margin: "1rem 0"}}>
                <Fab
                    variant="extended"
                    size="small"
                    color="primary"
                    aria-label="edit"
                    style={{float: "right", marginLeft: "2rem"}}
                    onClick={() => setArtifactPreview(artifactPreview.filter(a => a !== generatorId))}
                >
                    <CloseIcon/>{" "}
                    {t("close")}
                </Fab>
                <SingleArtifactPreview
                    key={generatorId}
                    generatorIdentifier={generatorId}
                />
            </Paper>
        )}
    </Container>
}
