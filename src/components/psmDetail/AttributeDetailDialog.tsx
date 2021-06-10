import {PimAttribute, PsmAttribute, Store} from "model-driven-data";
import React, {useState} from "react";
import {Button, Dialog, DialogContent, DialogTitle, Grid, TextField, Typography} from "@material-ui/core";

interface Parameters {
    store: Store,
    attribute: PsmAttribute | null,

    isOpen: boolean,
    close: () => void,

    updateTechnicalLabel: (attribute: PsmAttribute, label: string) => void,
}

const valueStyle = {
    fontFamily: "monospace",
    wordBreak: "break-all",
} as React.CSSProperties;

export const AttributeDetailDialog: React.FC<Parameters> = ({store, attribute, isOpen, close, updateTechnicalLabel}) => {
    const [technicalLabel, setTechnicalLabel] = useState<string>(attribute?.psmTechnicalLabel || "");

    const interpretation = attribute?.psmInterpretation ? store[attribute?.psmInterpretation] as PimAttribute : null;

    const saveLabel = () => {
        if (!attribute) return;
        close();
        updateTechnicalLabel(attribute, technicalLabel);
    }

    return <Dialog onClose={close} open={isOpen} maxWidth={"sm"} fullWidth>
        <DialogTitle id="customized-dialog-title">
            Attribute properties
        </DialogTitle>
        <DialogContent>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={9}>
                    <TextField
                        id="outlined-helperText"
                        label="Technical label"
                        value={technicalLabel}
                        onChange={event => setTechnicalLabel(event.target.value)}
                        onKeyDown={event => event.key === "Enter" && saveLabel()}
                        autoFocus
                        fullWidth
                        placeholder={"[unlabeled attribute]"}
                        variant={"filled"}
                    />
                </Grid>
                <Grid item xs={3}>
                    <Button onClick={saveLabel}>Update label</Button>
                </Grid>
            </Grid>

        </DialogContent>
        <DialogContent>
            <div><strong>Label: </strong>{attribute?.psmHumanLabel?.cs ? <pre>{attribute.psmHumanLabel.cs}</pre> : <em>no label</em>}</div>
            <div><strong>Description: </strong>{attribute?.psmHumanDescription?.cs ? <pre>{attribute.psmHumanDescription.cs}</pre> : <em>no description</em>}</div>
        </DialogContent>
        <DialogContent>
            <Typography variant={"h6"} gutterBottom>Interpretation</Typography>
            {attribute?.psmInterpretation ?
                <>
                    <div><strong>Label: </strong>{interpretation?.pimHumanLabel?.cs ? <span style={valueStyle}>{interpretation.pimHumanLabel.cs}</span> : <em>no label</em>}</div>
                    <div><strong>Description: </strong>{interpretation?.pimHumanDescription?.cs ? <span style={valueStyle}>{interpretation.pimHumanDescription.cs}</span> : <em>no description</em>}</div>
                </> :
                <em>This attribute has no interpretation.</em>
            }
        </DialogContent>
    </Dialog>;
}