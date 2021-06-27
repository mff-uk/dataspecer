import React from "react";
import {Button, DialogContent, Grid, Typography} from "@material-ui/core";
import {PsmBase} from "model-driven-data";

interface DetailStripParameters {
    title: string;
    psm: PsmBase;
}

export const PsmDetailStrip: React.FC<DetailStripParameters> = ({title, psm}) => {
    return <DialogContent dividers>
        {/*<Typography variant={"h6"} gutterBottom>{title}</Typography>
        {attribute?.psmInterpretation ?
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={9}>
                    <div><strong>Label: </strong>{interpretation?.pimHumanLabel?.cs ? <span style={valueStyle}>{interpretation.pimHumanLabel.cs}</span> : <em>no label</em>}</div>
                    <div><strong>Description: </strong>{interpretation?.pimHumanDescription?.cs ? <span style={valueStyle}>{interpretation.pimHumanDescription.cs}</span> : <em>no description</em>}</div>
                </Grid>
                <Grid item xs={3} style={{textAlign: "right"}}>
                    <Button onClick={() => null} color="primary">Update</Button>
                </Grid>
            </Grid>:
            <em>This attribute has no interpretation.</em>
        }*/}
    </DialogContent>
}