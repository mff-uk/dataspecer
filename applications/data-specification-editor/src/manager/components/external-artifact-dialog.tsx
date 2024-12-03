import React, {useCallback, useState} from "react";
import {Button, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField} from "@mui/material";
import {dialog} from "../../editor/dialog";
import { ArtifactType } from "../../artifact-types";
import { CloseDialogButton } from "../../editor/components/detail/components/close-dialog-button";

export interface ExternalArtifactDialogEditableProperties {
    type: string,
    url: string
}

/**
 * Dialog which edits basic properties of the data specification.
 */
export const ExternalArtifactDialog: React.FC<{
    isOpen: boolean,
    close: () => void,

    mode: "create" | "modify",

    properties?: Partial<ExternalArtifactDialogEditableProperties>,
    onSubmit: (properties: Partial<ExternalArtifactDialogEditableProperties>) => Promise<void>,
}> = dialog({maxWidth: "sm", fullWidth: true}, ({isOpen, close, mode, properties, onSubmit}) => {
    const [data, setData] = useState({
        type: null,
        url: "",
        ...properties
    } as ExternalArtifactDialogEditableProperties);

    const isDisabled = !data.type || !data.url;

    const typeInSelect = data.type === null ? null : Object.hasOwn(ArtifactType, data.type) ? data.type : "-";

    const trySubmit = useCallback(async () => {
        if (!isDisabled) {
            await onSubmit(data);
            close();
        }
    }, [close, data, onSubmit, isDisabled]);

    return <>
        <DialogTitle>
            {mode === "create" && "Add new external artifact"}
            {mode === "modify" && "Modify external artifact"}

            <CloseDialogButton onClick={close} />
        </DialogTitle>
        <DialogContent>
            <FormControl sx={{mb: 2, display: "block"}}>
                <FormLabel id="demo-radio-buttons-group-label">Typ artefaktu</FormLabel>
                <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    value={typeInSelect}
                    onChange={e => setData({...data, type: e.target.value === "-" ? "" : e.target.value})}

                    name="radio-buttons-group"
                >
                    {Object.keys(ArtifactType).map(key =>
                        <FormControlLabel key={key} value={key} control={<Radio />} label={ArtifactType[key] ?? key} />
                        )}
                    <FormControlLabel value="-" control={<Radio />} label="other value..." />
                </RadioGroup>
            </FormControl>

            {typeInSelect === "-" &&
                <TextField
                    sx={{flexGrow: 2, mb: 2}}
                    fullWidth
                    margin="dense"
                    variant="filled"
                    value={data.type}
                    label="Type"
                    onChange={e => setData({...data, type: e.target.value})}
                    onKeyDown={event => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            trySubmit().then();
                        }
                    }}
                />
            }

            <TextField
                sx={{flexGrow: 2, mb: 2}}
                margin="dense"
                autoFocus
                fullWidth
                variant="filled"
                value={data.url}
                label="URL externího artefaktu"
                onChange={e => setData({...data, url: e.target.value})}
                onKeyDown={event => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        trySubmit().then();
                    }
                }}
            />

            <Button sx={{mt: 2}} onClick={trySubmit} variant="contained" fullWidth disabled={isDisabled}>
                {mode === "create" && "Create"}
                {mode === "modify" && "Modify"}
            </Button>
        </DialogContent>
    </>;
});
