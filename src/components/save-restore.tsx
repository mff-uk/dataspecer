import React, {useCallback} from "react";
import {Fab} from "@material-ui/core";
import {useTranslation} from "react-i18next";
import SaveTwoToneIcon from "@material-ui/icons/SaveTwoTone";
import OpenInBrowserTwoToneIcon from "@material-ui/icons/OpenInBrowserTwoTone";
import {useSnackbar} from "notistack";
import {StoreContext} from "./App";
import {restoreState, saveState} from "../save/save-state";
import FileSaver from "file-saver";
import fileDialog from "file-dialog";
import {getNameForSchema} from "../utils/getNameForSchema";

export const SaveRestore: React.FC = () => {
    const {enqueueSnackbar} = useSnackbar();
    const {t, i18n} = useTranslation("save-restore");
    const {store, psmSchemas, setPsmSchemas} = React.useContext(StoreContext);


    const saveToFile = useCallback(async () => {
        const data = saveState({
            stores: store.getStores(),
            dataPsmSchemas: psmSchemas,
        });
        const blob = new Blob([data], {type: "application/gzip;charset=utf-8"});
        FileSaver.saveAs(blob, (await getNameForSchema(store, psmSchemas[0], i18n.languages) ?? t("file without name")) + ".sgen", {autoBom: false});
    }, [store, psmSchemas, i18n.languages]);


    const importFromFile = useCallback(async () => {
        const files = await fileDialog();
        if (files.length) {
            try {
                const file = files[0];
                const buffer = await file.arrayBuffer();
                const rawData = new Uint8Array(buffer);
                const state = restoreState(rawData);

                setPsmSchemas(state.dataPsmSchemas);
                store.getStores().forEach(s => store.removeStore(s));
                state.stores.forEach(s => store.addStore(s));

                enqueueSnackbar(t("snackbar load.ok"), {variant: "success"});
            } catch (e) {
                enqueueSnackbar(t("snackbar load.fail"), {variant: "error"});
            }
        }
    }, []);


    return (
        <>
            <div>
                <Fab title={t("save to file")} onClick={saveToFile} color="primary" size="medium" variant="extended" aria-label="add" style={{marginRight: "1rem"}} disabled={psmSchemas.length == 0}>
                    <SaveTwoToneIcon fontSize="small" />
                </Fab>
                <Fab title={t("import from file")} onClick={importFromFile} color="primary" size="medium" variant="extended" aria-label="add">
                    <OpenInBrowserTwoToneIcon fontSize="small" />
                </Fab>
            </div>
        </>
    );
};
