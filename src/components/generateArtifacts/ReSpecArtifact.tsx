import React, {memo, useCallback} from "react";
import {ListItemIcon, MenuItem} from "@material-ui/core";
import FindInPageTwoToneIcon from "@material-ui/icons/FindInPageTwoTone";
import DescriptionTwoToneIcon from "@material-ui/icons/DescriptionTwoTone";
import FileSaver from "file-saver";
import {useSnackbar} from "notistack";
import {useTranslation} from "react-i18next";
import {StoreContext} from "../App";
import {FederatedModelReader} from "model-driven-data/io/model-reader/federated-model-reader";
import {coreResourcesToObjectModel} from "model-driven-data/object-model";
import {objectModelToReSpec, writeReSpec} from "model-driven-data/respec";
import {MemoryOutputStream} from "model-driven-data/io/stream/memory-output-stream";
import {ModelObserverContainer} from "../../ModelObserverContainer";

async function generateReSpec(models: {pim: ModelObserverContainer, dataPsm: ModelObserverContainer}, psmSchemas: string[]): Promise<string> {
    const reader = new FederatedModelReader([models.pim.model, models.dataPsm.model]);
    const objectModel = await coreResourcesToObjectModel(reader, psmSchemas[0] as string);
    const reSpec = objectModelToReSpec(objectModel);
    const stream = new MemoryOutputStream();
    await writeReSpec(reSpec, stream);
    return stream.getContent();
}

/**
 * Component adding additional menu item for ReSpec generation.
 */
export const ReSpecArtifact: React.FC<{close: () => void}> = memo(({close}) => {
    const {enqueueSnackbar} = useSnackbar();
    const {t} = useTranslation("artifacts");
    const {models, psmSchemas} = React.useContext(StoreContext);

    const ReSpecPreview = useCallback(async () => {
        try {
            const reSpec = await generateReSpec(models, psmSchemas);
            close();
            if (reSpec) {
                const win = window.open("", "ReSpec documentation", "resizable,scrollbars,status");
                if (win) {
                    win.document.write(reSpec);
                    win.document.close();
                }
            }
        } catch (_) {
            enqueueSnackbar(t("snackbar ReSpec.fail"), {variant: "error"});
        }
    }, [close, models, psmSchemas]);

    const ReSpecDownload = useCallback(async () => {
        try {
            const reSpec = await generateReSpec(models, psmSchemas);
            close();
            if (reSpec) {
                const data = new Blob([reSpec], {type: "text/html;charset=utf-8"});
                FileSaver.saveAs(data, "ReSpec.html", {autoBom: false});
            }
        } catch (_) {
            enqueueSnackbar(t("snackbar ReSpec.fail"), {variant: "error"});
        }
    }, [close, models, psmSchemas]);

    return <>
        <MenuItem disabled style={{opacity: 1, fontWeight: "bold"}}>ReSpec</MenuItem>

        <MenuItem onClick={ReSpecPreview}><ListItemIcon><FindInPageTwoToneIcon fontSize="small" /></ListItemIcon>{t("ReSpec preview")}</MenuItem>
        <MenuItem onClick={ReSpecDownload}><ListItemIcon><DescriptionTwoToneIcon fontSize="small" /></ListItemIcon>{t("ReSpec download")}</MenuItem>
    </>;
})
