import { LanguageString } from "@dataspecer/core/core";
import { LoadingButton } from "@mui/lab";
import { DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { dialog } from "../../editor/dialog";

export interface SpecificationCloneDialogEditableProperties {
    label: LanguageString,
    // tags: string[],
    // type: string,
}

/**
 * Dialog which opts user to clone the data specification.
 */
export const SpecificationCloneDialog: React.FC<{
    isOpen: boolean,
    close: () => void,

    properties?: Partial<SpecificationCloneDialogEditableProperties>,
    onSubmit: (properties: Partial<SpecificationCloneDialogEditableProperties>) => Promise<void>,
}> = dialog({maxWidth: "xs", fullWidth: true}, ({isOpen, close, properties, onSubmit}) => {
    const [label, setLabel] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLabel(properties?.label?.en ?? "");
    }, [setLabel, properties, isOpen]);

    const submit = useCallback(async () => {
        setLoading(true);

        const change = {} as Partial<SpecificationCloneDialogEditableProperties>;

        if (label !== properties?.label?.["en"]) {
            change.label = {
                ...properties?.label,
                en: label,
            };
        }

        await onSubmit(change);
        close();
        setLoading(false);
    }, [close, label, onSubmit, properties?.label]);

    return <>
        <DialogTitle>
            Clone data specification
        </DialogTitle>
        <DialogContent>
            <TextField
                autoFocus
                margin="dense"
                id="name"
                fullWidth
                variant="filled"
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
            <Typography variant="body2" sx={{mt: 1}}>
                A full copy of the data specification will be created. The original remains intact without any links to the new specification.
            </Typography>
        </DialogContent>
        <DialogActions>
            <LoadingButton onClick={submit} fullWidth variant="contained" loading={loading}>
                Clone
            </LoadingButton>
        </DialogActions>
    </>;
});
