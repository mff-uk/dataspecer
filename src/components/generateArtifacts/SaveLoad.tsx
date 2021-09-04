import React, {memo, useCallback} from "react";
import {ListItemIcon, MenuItem} from "@material-ui/core";
import {useSnackbar} from "notistack";
import {useTranslation} from "react-i18next";
import {StoreContext} from "../App";
import copy from "copy-to-clipboard";
import FileSaver from "file-saver";
import {ModelObserverContainer} from "../../ModelObserverContainer";
import {PimMemoryStore} from "model-driven-data/pim/store/memory-store/pim-memory-store";
import {DataPsmMemoryStore} from "model-driven-data/data-psm/store";
import fileDialog from "file-dialog";
import SaveTwoToneIcon from '@material-ui/icons/SaveTwoTone';
import AssignmentTwoToneIcon from '@material-ui/icons/AssignmentTwoTone';
import OpenInBrowserTwoToneIcon from '@material-ui/icons/OpenInBrowserTwoTone';

export const SaveLoad: React.FC<{close: () => void}> = memo(({close}) => {
    const {enqueueSnackbar} = useSnackbar();
    const {t} = useTranslation("artifacts");
    const {models, psmSchemas, setModels, setPsmSchemas} = React.useContext(StoreContext);

    const storeToClipboard = useCallback(() => {
        close();
        if (copy(JSON.stringify([models.pim.model, models.dataPsm.model, psmSchemas]))) {
            enqueueSnackbar(t("snackbar copied to clipboard.ok"), {variant: "success"});
        } else {
            enqueueSnackbar(t("snackbar copied to clipboard.failed"), {variant: "error"});
        }
    }, [close, models.pim.model, models.dataPsm.model, psmSchemas, enqueueSnackbar, t]);

    const saveToFile = useCallback(() => {
        close();
        const data = new Blob([JSON.stringify([models.pim.model, models.dataPsm.model, psmSchemas])], {type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(data, "platform-model.json", {autoBom: false});
    }, [close, models.pim.model, models.dataPsm.model, psmSchemas]);

    const fileToStore = useCallback(async () => {
        close();
        const files = await fileDialog();
        if (files.length) {
            try {
                const file = files[0];
                const text = await file.text();
                let [pim, dataPsm, psmSchemas] = JSON.parse(text);
                const models = {
                    pim: new ModelObserverContainer(Object.setPrototypeOf(pim, new PimMemoryStore())),
                    dataPsm: new ModelObserverContainer(Object.setPrototypeOf(dataPsm, new DataPsmMemoryStore())),
                };
                setModels(models);
                setPsmSchemas(psmSchemas);
                enqueueSnackbar(t("snackbar load.ok"), {variant: "success"});
            } catch (e) {
                enqueueSnackbar(t("snackbar load.fail"), {variant: "error"});
            }
        }
    }, [close, enqueueSnackbar, setModels, setPsmSchemas, t]);


    return <>
        <MenuItem disabled style={{opacity: 1, fontWeight: "bold"}}>Model</MenuItem>

        <MenuItem onClick={saveToFile}><ListItemIcon><SaveTwoToneIcon fontSize="small" /></ListItemIcon>{t("models JSON as file")}</MenuItem>
        <MenuItem onClick={storeToClipboard}><ListItemIcon><AssignmentTwoToneIcon fontSize="small" /></ListItemIcon>{t("models JSON to clipboard")}</MenuItem>
        <MenuItem onClick={fileToStore}><ListItemIcon><OpenInBrowserTwoToneIcon fontSize="small" /></ListItemIcon>{t("import models JSON")}</MenuItem>
    </>;
})
