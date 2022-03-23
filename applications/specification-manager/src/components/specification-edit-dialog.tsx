import React, {useCallback, useEffect, useState} from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import {LanguageString} from "@model-driven-data/core/core";

export interface SpecificationEditDialogEditableProperties {
    label: LanguageString,
}

/**
 * Dialog which edits basic properties of the data specification.
 */
export const SpecificationEditDialog: React.FC<{
    isOpen: boolean,
    close: () => void,

    mode: "create" | "modify",

    properties?: SpecificationEditDialogEditableProperties,
    onSubmit: (properties: Partial<SpecificationEditDialogEditableProperties>) => Promise<void>,
}> = ({isOpen, close, mode, properties, onSubmit}) => {
    const [label, setLabel] = useState("");

    useEffect(() => {
        setLabel(properties?.label?.en ?? "");
    }, [setLabel, properties, isOpen]);

    const submit = useCallback(async () => {
        const change = {} as Partial<SpecificationEditDialogEditableProperties>;

        if (label !== properties?.label?.["en"]) {
            change.label = {
                ...properties?.label,
                en: label,
            };
        }

        await onSubmit(change);
    }, [label, onSubmit, properties?.label]);

    return <Dialog open={isOpen} onClose={close} maxWidth={"xs"} fullWidth>
        <DialogTitle>
            {mode === "create" && "Create new data specification"}
            {mode === "modify" && "Modify data specification"}
        </DialogTitle>
        <DialogContent>
            <TextField
                autoFocus
                margin="dense"
                id="name"
                fullWidth
                variant="standard"
                value={label}
                label="Label"
                onChange={e => setLabel(e.target.value)}
                onKeyDown={event => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        submit().then();
                    }
                }}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={submit} fullWidth variant="contained">
                {mode === "create" && "Create"}
                {mode === "modify" && "Modify"}
            </Button>
        </DialogActions>
    </Dialog>;
}
