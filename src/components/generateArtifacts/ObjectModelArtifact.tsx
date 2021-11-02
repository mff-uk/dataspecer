import React, {ReactElement} from "react";
import {coreResourcesToObjectModel} from "model-driven-data/object-model";
import {CoreResourceReader} from "model-driven-data/core";
import {Box} from "@mui/material";

export async function getObjectModelArtifact(reader: CoreResourceReader, schema: string) {
    return JSON.stringify(await coreResourcesToObjectModel(reader, schema), null, 4);
}

export async function GetPreviewComponentObjectModelArtifact(reader: CoreResourceReader, schema: string): Promise<ReactElement> {
    const objectModel = await getObjectModelArtifact(reader, schema);
    if (!objectModel) {
        throw new Error("No schema returned");
    }
    return <Box sx={{whiteSpace: "pre"}}>
        {objectModel}
    </Box>;
}
