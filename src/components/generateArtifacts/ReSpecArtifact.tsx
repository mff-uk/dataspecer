import React, {memo, useCallback} from "react";
import {ListItemIcon, MenuItem} from "@mui/material";
import FindInPageTwoToneIcon from "@mui/icons-material/FindInPageTwoTone";
import DescriptionTwoToneIcon from "@mui/icons-material/DescriptionTwoTone";
import FileSaver from "file-saver";
import {useSnackbar} from "notistack";
import {useTranslation} from "react-i18next";
import {StoreContext} from "../App";
import {coreResourcesToObjectModel} from "model-driven-data/object-model";
import {objectModelToReSpec, writeReSpec} from "model-driven-data/respec";
import {MemoryOutputStream} from "model-driven-data/io/stream/memory-output-stream";
import {CoreResourceReader} from "model-driven-data/core";

async function generateReSpec(reader: CoreResourceReader, fromSchema: string): Promise<string> {
    const objectModel = await coreResourcesToObjectModel(reader, fromSchema);
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
    const {store, psmSchemas} = React.useContext(StoreContext);

    const ReSpecPreview = useCallback(async () => {
        try {
            const reSpec = await generateReSpec(store, psmSchemas[0]); // todo let user select which schema
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
    }, [close, store, psmSchemas]);

    const ReSpecDownload = useCallback(async () => {
        try {
            const reSpec = await generateReSpec(store, psmSchemas[0]); // todo let user select which schema
            close();
            if (reSpec) {
                const data = new Blob([reSpec], {type: "text/html;charset=utf-8"});
                FileSaver.saveAs(data, "ReSpec.html", {autoBom: false});
            }
        } catch (_) {
            enqueueSnackbar(t("snackbar ReSpec.fail"), {variant: "error"});
        }
    }, [close, store, psmSchemas]);

    return <>
        <MenuItem disabled style={{opacity: 1, fontWeight: "bold"}}>ReSpec</MenuItem>

        <MenuItem onClick={ReSpecPreview}><ListItemIcon><FindInPageTwoToneIcon fontSize="small" /></ListItemIcon>{t("ReSpec preview")}</MenuItem>
        <MenuItem onClick={ReSpecDownload}><ListItemIcon><DescriptionTwoToneIcon fontSize="small" /></ListItemIcon>{t("ReSpec download")}</MenuItem>
    </>;
})
