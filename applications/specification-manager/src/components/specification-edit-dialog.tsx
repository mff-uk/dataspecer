import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, ListItemText, MenuItem, Select, TextField} from "@mui/material";
import {LanguageString} from "@model-driven-data/core/core";
import {AvailableTags} from "../routes/home/filter-by-tag";
import {isEqual} from "lodash";

export interface SpecificationEditDialogEditableProperties {
    label: LanguageString,
    tags: string[],
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
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        setLabel(properties?.label?.en ?? "");
        setTags(properties?.tags ?? []);
    }, [setLabel, properties, isOpen]);

    const submit = useCallback(async () => {
        const change = {} as Partial<SpecificationEditDialogEditableProperties>;

        if (label !== properties?.label?.["en"]) {
            change.label = {
                ...properties?.label,
                en: label,
            };
        }

        if (!isEqual(new Set(properties?.tags ?? []), new Set(tags))) {
            change.tags = tags;
        }

        await onSubmit(change);
    }, [label, onSubmit, properties, tags]);

    const existingTags = React.useContext(AvailableTags);

    const tagRef = useRef(null);

    const [customTags, setCustomTags] = useState<string[]>([]);
    const [customTagField, setCustomTagField] = useState<string>("");

    const availableTags = useMemo(() => [...existingTags, ...customTags], [existingTags, customTags]);

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
            <FormControl variant="standard" sx={{mt: 2, width: "100%" }}>
                <InputLabel ref={tagRef}>Tags</InputLabel>
                <Select
                    label={tagRef.current}
                    multiple
                    value={tags}
                    fullWidth
                    onChange={e => setTags(e.target.value as string[])}
                    renderValue={(selected) => selected.join(', ')}
                >
                    {availableTags.map((tag) => (
                        <MenuItem key={tag} value={tag}>
                            <Checkbox checked={tags.includes(tag)} />
                            <ListItemText primary={tag} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Box sx={{display: "flex", flexDirection: "row", gap: 1, mt: 1}}>
                <TextField
                    label="New tag"
                    color="info"
                    size="small"
                    fullWidth
                    value={customTagField}
                    onChange={e => setCustomTagField(e.target.value)}
                />
                <Button sx={{width: "30%"}} onClick={() => {
                    if (customTagField.length > 0) {
                        if (!availableTags.includes(customTagField)) {
                            setCustomTags([...customTags, customTagField]);
                        }
                        if (!tags.includes(customTagField)) {
                            setTags([...tags, customTagField]);
                        }
                        setCustomTagField("");
                    }
                }} variant="outlined" color="inherit" size="small">
                    Add tag
                </Button>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={submit} fullWidth variant="contained">
                {mode === "create" && "Create"}
                {mode === "modify" && "Modify"}
            </Button>
        </DialogActions>
    </Dialog>;
}
