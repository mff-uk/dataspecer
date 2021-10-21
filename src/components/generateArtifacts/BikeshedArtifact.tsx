import React, {memo, useCallback} from "react";
import {ListItemIcon, MenuItem} from "@mui/material";
import FindInPageTwoToneIcon from "@mui/icons-material/FindInPageTwoTone";
import DescriptionTwoToneIcon from "@mui/icons-material/DescriptionTwoTone";
import FileSaver from "file-saver";
import {useSnackbar} from "notistack";
import {useTranslation} from "react-i18next";
import {StoreContext} from "../App";
import {coreResourcesToObjectModel} from "model-driven-data/object-model";
import {MemoryOutputStream} from "model-driven-data/io/stream/memory-output-stream";
import {objectModelToBikeshed, writeBikeshed} from "model-driven-data/bikeshed";
import {CoreResourceReader} from "model-driven-data/core";

function openWindowWithPost(url: string, data: Record<string, string>) {
    const form = document.createElement("form");
    form.target = "_blank";
    form.method = "POST";
    form.action = url;
    form.style.display = "none";

    for (const key in data) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = data[key];
        form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

async function generateBikeshed(reader: CoreResourceReader, fromSchema: string): Promise<string> {
    const objectModel = await coreResourcesToObjectModel(reader, fromSchema);
    const bikeshed = objectModelToBikeshed(objectModel);
    const stream = new MemoryOutputStream();
    await writeBikeshed(bikeshed, stream);
    return stream.getContent();
}

/**
 * Component adding additional menu item for Bikeshed generation.
 */
export const BikeshedArtifact: React.FC<{close: () => void}> = memo(({close}) => {
    const {enqueueSnackbar} = useSnackbar();
    const {t} = useTranslation("artifacts");
    const {store, psmSchemas} = React.useContext(StoreContext);

    const BikeshedPreview = useCallback(async () => {
        try {
            const bikeshed = await generateBikeshed(store, psmSchemas[0]); // todo let user select which schema
            close();
            if (bikeshed) {
                openWindowWithPost("https://api.csswg.org/bikeshed/", {
                    text: bikeshed,
                    force: "1",
                    input: "spec",
                    output: "html",
                    action: "Process",
                });
            }
        } catch (_) {
            enqueueSnackbar(t("snackbar Bikeshed.fail"), {variant: "error"});
        }
    }, [close, store, psmSchemas]);

    const BikeshedDownload = useCallback(async () => {
        try {
            const bikeshed = await generateBikeshed(store, psmSchemas[0]); // todo let user select which schema
            close();
            if (bikeshed) {
                const data = new Blob([bikeshed], {type: "text/html;charset=utf-8"});
                FileSaver.saveAs(data, "bikeshed.bs", {autoBom: false});
            }
        } catch (_) {
            enqueueSnackbar(t("snackbar Bikeshed.fail"), {variant: "error"});
        }
    }, [close, store, psmSchemas]);

    return <>
        <MenuItem disabled style={{opacity: 1, fontWeight: "bold"}}>Bikeshed</MenuItem>

        <MenuItem onClick={BikeshedPreview}><ListItemIcon><FindInPageTwoToneIcon fontSize="small" /></ListItemIcon>{t("Bikeshed preview external")}</MenuItem>
        <MenuItem onClick={BikeshedDownload}><ListItemIcon><DescriptionTwoToneIcon fontSize="small" /></ListItemIcon>{t("Bikeshed download source")}</MenuItem>
    </>;
})
