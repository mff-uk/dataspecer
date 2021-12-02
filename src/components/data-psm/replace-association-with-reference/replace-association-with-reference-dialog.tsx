import {Alert, Button, DialogActions, DialogContent, DialogTitle, Grid, List, ListItemButton, ListItemText} from "@mui/material";
import {DataPsmSchemaItem} from "../DataPsmSchemaItem";
import {DataPsmSchema} from "model-driven-data/data-psm/model";
import {useResource} from "../../../hooks/useResource";
import React, {memo, useEffect, useState} from "react";
import {LanguageStringUndefineable} from "../../helper/LanguageStringComponents";
import {useTranslation} from "react-i18next";
import {DataPsmItemTreeContext} from "../data-psm-item-tree-context";
import {dialog} from "../../../dialog";

const SchemaListItem: React.FC<{
    dataPsmSchemaIri: string,
    selected: boolean,
    onSelect: () => void
}> = memo(({dataPsmSchemaIri, selected, onSelect}) => {
    const {t} = useTranslation("psm");

    const {resource: schema} = useResource<DataPsmSchema>(dataPsmSchemaIri);
    return <ListItemButton key={dataPsmSchemaIri} selected={selected} onClick={onSelect}>
        <LanguageStringUndefineable from={schema?.dataPsmHumanLabel ?? null}>{label =>
            <LanguageStringUndefineable from={schema?.dataPsmHumanDescription ?? null}>{description =>
                <ListItemText primary={label ?? <i>{t("no label")}</i>} secondary={description ?? <i>{t("no description")}</i>} />
            }</LanguageStringUndefineable>
        }</LanguageStringUndefineable>
    </ListItemButton>;
});

export const ReplaceAssociationWithReferenceDialog: React.FC<{
    isOpen: boolean;
    close: () => void;
    roots: string[];
    onSelect: (dataPsmSchemaIri: string) => void;
}> = dialog({maxWidth: "lg", fullWidth: true}, memo(({isOpen, close, roots, onSelect}) => {
    const {t} = useTranslation("psm");

    const [selected, setSelected] = useState<string | undefined>(undefined);
    useEffect(() => setSelected(roots?.[0]), [roots]);

    return <>
        <DialogTitle>
            {t("replace association with reference.title")}
        </DialogTitle>
        <DialogContent>
            <Alert severity="info">{t("replace association with reference.help")}</Alert>
            <Grid container spacing={3}>
                <Grid item xs={3}>
                    <List component="nav" dense>
                        {roots.map(root =>
                            <SchemaListItem
                                dataPsmSchemaIri={root}
                                selected={selected === root}
                                onSelect={() => setSelected(root)}
                            />
                        )}
                    </List>
                </Grid>
                <Grid item xs={9}>
                    <DataPsmItemTreeContext.Provider  value={{readonly: true}}>
                        {selected && <DataPsmSchemaItem dataPsmSchemaIri={selected} />}
                    </DataPsmItemTreeContext.Provider>
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={close}>{t("cancel")}</Button>
            <Button onClick={() => {
                close();
                if (selected) {
                    onSelect(selected);
                }
            }}>{t("replace")}</Button>
        </DialogActions>
    </>
}));
