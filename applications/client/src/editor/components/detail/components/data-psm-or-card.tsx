import { Grid } from "@mui/material";
import React, { memo } from "react";
import { RightPanel } from "./right-panel";

export const DataPsmOrCard: React.FC<{ iri: string, onClose: () => void  }> = memo(({iri, onClose}) => {
    return <>
        <Grid container spacing={5} sx={{pt: 3}}>
            <Grid item xs={6}>
            </Grid>
            <Grid item xs={6}>
                <RightPanel iri={iri} close={onClose}/>
            </Grid>
        </Grid>
    </>;
});
