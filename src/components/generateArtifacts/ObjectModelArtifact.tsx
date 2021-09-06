import React, {memo, useCallback} from "react";
import {ListItemIcon, MenuItem} from "@material-ui/core";
import FindInPageTwoToneIcon from "@material-ui/icons/FindInPageTwoTone";
import DescriptionTwoToneIcon from "@material-ui/icons/DescriptionTwoTone";
import FileSaver from "file-saver";
import {useSnackbar} from "notistack";
import {useTranslation} from "react-i18next";
import {StoreContext} from "../App";
import {coreResourcesToObjectModel} from "model-driven-data/object-model";
import {ModelObserverContainer} from "../../ModelObserverContainer";
import copy from "copy-to-clipboard";
import {FederatedResourceReader} from "model-driven-data/core/store/federated-resource-reader";

async function generateObjectModel(models: {pim: ModelObserverContainer, dataPsm: ModelObserverContainer}, psmSchemas: string[]) {
    const reader = new FederatedResourceReader([models.pim.model, models.dataPsm.model]);
    return await coreResourcesToObjectModel(reader, psmSchemas[0] as string);
}

/**
 * Component adding additional menu item for ReSpec generation.
 */
export const ObjectModelArtifact: React.FC<{close: () => void}> = memo(({close}) => {
    const {enqueueSnackbar} = useSnackbar();
    const {t} = useTranslation("artifacts");
    const {models, psmSchemas} = React.useContext(StoreContext);

    const objectModelDownload = useCallback(async () => {
        try {
            const objectModelSchema = JSON.stringify(await generateObjectModel(models, psmSchemas));
            close();
            if (objectModelSchema) {
                const data = new Blob([objectModelSchema], {type: "text/json;charset=utf-8"});
                FileSaver.saveAs(data, "object-model.json", {autoBom: false});
            }
        } catch (_) {
            enqueueSnackbar(t("snackbar object-model.fail"), {variant: "error"});
        }
    }, [close, models, psmSchemas]);

    const storeToClipboard = useCallback(async () => {
        close();
        if (copy(JSON.stringify(await generateObjectModel(models, psmSchemas)))) {
            enqueueSnackbar(t("snackbar copied to clipboard.ok"), {variant: "success"});
        } else {
            enqueueSnackbar(t("snackbar copied to clipboard.failed"), {variant: "error"});
        }
    }, [close, models.pim.model, models.dataPsm.model, psmSchemas, enqueueSnackbar, t]);

    return <>
        <MenuItem disabled style={{opacity: 1, fontWeight: "bold"}}>Object-model</MenuItem>

        <MenuItem onClick={storeToClipboard}><ListItemIcon><FindInPageTwoToneIcon fontSize="small" /></ListItemIcon>{t("object-model to clipboard")}</MenuItem>
        <MenuItem onClick={objectModelDownload}><ListItemIcon><DescriptionTwoToneIcon fontSize="small" /></ListItemIcon>{t("object-model download")}</MenuItem>
    </>;
})
