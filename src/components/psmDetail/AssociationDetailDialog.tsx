import {PimAttribute, PsmAssociation, Store} from "model-driven-data";
import React, {useState} from "react";
import {Button, Dialog, DialogContent, DialogTitle, Grid, TextField, Typography} from "@material-ui/core";

interface Parameters {
    store: Store,
    association: PsmAssociation | null,

    isOpen: boolean,
    close: () => void,

    updateTechnicalLabel: (association: PsmAssociation, label: string) => void,
}

const valueStyle = {
    fontFamily: "monospace",
    wordBreak: "break-all",
} as React.CSSProperties;

export const AssociationDetailDialog: React.FC<Parameters> = ({store, association, isOpen, close, updateTechnicalLabel}) => {
    const [technicalLabel, setTechnicalLabel] = useState<string>(association?.psmTechnicalLabel || "");

    const interpretation = association?.psmInterpretation ? store[association?.psmInterpretation] as PimAttribute : null;

    const saveLabel = () => {
        if (!association) return;
        close();
        updateTechnicalLabel(association, technicalLabel);
    }

    return <Dialog onClose={close} open={isOpen} maxWidth={"sm"} fullWidth>
        <DialogTitle id="customized-dialog-title">
            Association properties
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
                        placeholder={"[unlabeled association]"}
                        variant={"filled"}
                    />
                </Grid>
                <Grid item xs={3}>
                    <Button onClick={saveLabel}>Update label</Button>
                </Grid>
            </Grid>

        </DialogContent>
        <DialogContent>
            <div><strong>Label: </strong>{association?.psmHumanLabel?.cs ? <pre>{association.psmHumanLabel.cs}</pre> : <em>no label</em>}</div>
            <div><strong>Description: </strong>{association?.psmHumanDescription?.cs ? <pre>{association.psmHumanDescription.cs}</pre> : <em>no description</em>}</div>
        </DialogContent>
        <DialogContent>
            <Typography variant={"h6"} gutterBottom>Interpretation</Typography>
            {association?.psmInterpretation ?
                <>
                    <div><strong>Label: </strong>{interpretation?.pimHumanLabel?.cs ? <span style={valueStyle}>{interpretation.pimHumanLabel.cs}</span> : <em>no label</em>}</div>
                    <div><strong>Description: </strong>{interpretation?.pimHumanDescription?.cs ? <span style={valueStyle}>{interpretation.pimHumanDescription.cs}</span> : <em>no description</em>}</div>
                </> :
                <em>This association has no interpretation.</em>
            }
        </DialogContent>
    </Dialog>;
}