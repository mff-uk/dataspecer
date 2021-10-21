import React, {memo, useCallback} from "react";
import {ListItemIcon, MenuItem} from "@mui/material";
import FindInPageTwoToneIcon from "@mui/icons-material/FindInPageTwoTone";
import DescriptionTwoToneIcon from "@mui/icons-material/DescriptionTwoTone";
import FileSaver from "file-saver";
import {useSnackbar} from "notistack";
import {useTranslation} from "react-i18next";
import {StoreContext} from "../App";
import {coreResourcesToObjectModel} from "model-driven-data/object-model";
import copy from "copy-to-clipboard";

/**
 * Component adding additional menu item for ReSpec generation.
 */
export const ObjectModelArtifact: React.FC<{close: () => void}> = memo(({close}) => {
    const {enqueueSnackbar} = useSnackbar();
    const {t} = useTranslation("artifacts");
    const {store, psmSchemas} = React.useContext(StoreContext);

    const objectModelDownload = useCallback(async () => {
        try {
            const objectModelSchema = JSON.stringify(await coreResourcesToObjectModel(store, psmSchemas[0]), null, 4);
            close();
            if (objectModelSchema) {
                const data = new Blob([objectModelSchema], {type: "text/json;charset=utf-8"});
                FileSaver.saveAs(data, "object-model.json", {autoBom: false});
            }
        } catch (_) {
            enqueueSnackbar(t("snackbar object-model.fail"), {variant: "error"});
        }
    }, [close, store, psmSchemas]);

    const storeToClipboard = useCallback(async () => {
        close();
        if (copy(JSON.stringify(await coreResourcesToObjectModel(store, psmSchemas[0]), null, 4))) {
            enqueueSnackbar(t("snackbar copied to clipboard.ok"), {variant: "success"});
        } else {
            enqueueSnackbar(t("snackbar copied to clipboard.failed"), {variant: "error"});
        }
    }, [close, store, psmSchemas, enqueueSnackbar, t]);

    return <>
        <MenuItem disabled style={{opacity: 1, fontWeight: "bold"}}>Object-model</MenuItem>

        <MenuItem onClick={storeToClipboard}><ListItemIcon><FindInPageTwoToneIcon fontSize="small" /></ListItemIcon>{t("object-model to clipboard")}</MenuItem>
        <MenuItem onClick={objectModelDownload}><ListItemIcon><DescriptionTwoToneIcon fontSize="small" /></ListItemIcon>{t("object-model download")}</MenuItem>
    </>;
})
