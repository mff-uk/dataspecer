import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    TextField,
    Typography
} from "@mui/material";
import React, {useCallback, useEffect, useState} from "react";
import TranslateIcon from '@mui/icons-material/Translate';
import {LanguageString} from "model-driven-data/core";

export interface LabelAndDescriptionLanguageStrings {
    label: LanguageString;
    description: LanguageString;
}

interface LabelDescriptionEditorParameters {
    isOpen: boolean;
    close: () => void;

    data: LabelAndDescriptionLanguageStrings;
    update: (data: LabelAndDescriptionLanguageStrings) => void;
}

export const LabelDescriptionEditor: React.FC<LabelDescriptionEditorParameters> = ({isOpen, close, data: {label: sourceLabel, description: sourceDescription}, update}) => {
    const [lang, setLang] = useState<string>("");

    const [availableLangs, setAvailableLangs_internal] = useState<string[]>([]);
    const setAvailableLangs = useCallback((langs: string[]) => setAvailableLangs_internal([...new Set(langs)].sort()), [setAvailableLangs_internal]);
    const [label, setLabel_internal] = useState<LanguageString>({});
    const setLabel = useCallback((languageString: LanguageString) => setLabel_internal(Object.fromEntries(Object.entries(languageString).filter(([, v]) => v != null))), []);
    const [description, setDescription_internal] = useState<LanguageString>({});
    const setDescription = useCallback((languageString: LanguageString) => setDescription_internal(Object.fromEntries(Object.entries(languageString).filter(([, v]) => v != null))), []);

    const [newLang, setNewLang] = useState<string>("");
    const addNewLang = useCallback(() => {
        setAvailableLangs([...availableLangs, newLang]);
        setLang(newLang);
        setNewLang("");
    }, [availableLangs, newLang, setAvailableLangs]);

    const callUpdate = useCallback(() => {
        close();
        const filteredLabel = Object.fromEntries(Object.entries(label).filter(([, b]) => b.length));
        const filteredDescription = Object.fromEntries(Object.entries(description).filter(([, b]) => b.length));
        update({
            label: filteredLabel,
            description: filteredDescription,
        });
        }, [close, update, label, description]);

    useEffect(() => {
        setAvailableLangs([...Object.keys(sourceLabel), ...Object.keys(sourceDescription)]);
        setLabel({...sourceLabel});
        setDescription({...sourceDescription});

        const sorted = [...Object.keys(sourceLabel), ...Object.keys(sourceDescription)].sort();
        setLang(sorted.length ? sorted[0] : "");
    }, [sourceLabel, sourceDescription, setAvailableLangs, setLabel, setDescription]);

    return (
        <Dialog onClose={close} open={isOpen} maxWidth={"sm"} fullWidth>
            <DialogTitle id="customized-dialog-title">
                Edit label and description
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={5}>
                        <List component="nav">
                            {availableLangs.map(l =>
                                <ListItem button selected={l === lang} onClick={() => setLang(l)} key={l}><ListItemIcon><TranslateIcon /></ListItemIcon><ListItemText primary={l} /></ListItem>
                            )}
                            <ListItem>
                                <TextField
                                    variant="standard"
                                    fullWidth
                                    value={newLang}
                                    onChange={e => setNewLang(e.target.value)}
                                    error={availableLangs.includes(newLang)}
                                    onKeyDown={event => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            newLang.length && !availableLangs.includes(newLang) && addNewLang();
                                        }
                                    }}
                                />
                                <Box mx={1} />
                                <Button color={"primary"} disabled={!newLang.length || availableLangs.includes(newLang)} onClick={addNewLang}>add</Button>
                            </ListItem>
                        </List>
                    </Grid>
                    {lang.length ?
                        <Grid item xs={7}>
                            <TextField
                                label="Label"
                                variant="filled"
                                fullWidth
                                value={label[lang] ?? ""}
                                onChange={e => setLabel({...label, [lang]: e.target.value})}
                            />
                            <Box my={3}/>
                            <TextField
                                label="Description"
                                variant="outlined"
                                multiline
                                fullWidth
                                rows={3}
                                maxRows={10}
                                value={description[lang] ?? ""}
                                onChange={e => setDescription({...description, [lang]: e.target.value})}
                            />
                        </Grid>
                        :
                        <Grid item xs={7} style={{textAlign: "center"}}>
                            <Typography color={"textSecondary"}>Select a language first.</Typography>
                        </Grid>
                    }
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={close} color="primary">
                    Cancel
                </Button>
                <Button onClick={callUpdate} color="primary" autoFocus>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};
