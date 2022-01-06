import React, {memo} from "react";
import {LanguageString} from "@model-driven-data/core/lib/core";
import {Grid} from "@mui/material";
import {InDifferentLanguages} from "./InDifferentLanguages";
import {RightPanel} from "./right-panel";

export const BasicInfo: React.FC<{ iri: string, label: LanguageString, description: LanguageString, close: () => void }>
    = memo(({iri, label, description, close}) => {

    return (
        <Grid container spacing={5} sx={{pt: 3}}>
            <Grid item xs={6}>
                <InDifferentLanguages label={label} description={description} resourceType="dataPsm" iri={iri}/>
            </Grid>
            <Grid item xs={6}>
                <RightPanel iri={iri} close={close}/>
            </Grid>
        </Grid>
    );
});
