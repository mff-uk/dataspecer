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
import {MemoryOutputStream} from "model-driven-data/io/stream/memory-output-stream";
import {ModelObserverContainer} from "../../ModelObserverContainer";
import {objectModelToBikeshed, writeBikeshed} from "model-driven-data/bikeshed";

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

async function generateBikeshed(models: {pim: ModelObserverContainer, dataPsm: ModelObserverContainer}, psmSchemas: string[]): Promise<string> {
    const reader = new FederatedModelReader([models.pim.model, models.dataPsm.model]);
    const objectModel = await coreResourcesToObjectModel(reader, psmSchemas[0] as string);
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
    const {models, psmSchemas} = React.useContext(StoreContext);

    const BikeshedPreview = useCallback(async () => {
        try {
            const bikeshed = await generateBikeshed(models, psmSchemas);
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
    }, [close, models, psmSchemas]);

    const BikeshedDownload = useCallback(async () => {
        try {
            const bikeshed = await generateBikeshed(models, psmSchemas);
            close();
            if (bikeshed) {
                const data = new Blob([bikeshed], {type: "text/html;charset=utf-8"});
                FileSaver.saveAs(data, "bikeshed.bs", {autoBom: false});
            }
        } catch (_) {
            enqueueSnackbar(t("snackbar Bikeshed.fail"), {variant: "error"});
        }
    }, [close, models, psmSchemas]);

    return <>
        <MenuItem onClick={BikeshedPreview}><ListItemIcon><FindInPageTwoToneIcon fontSize="small" /></ListItemIcon>{t("Bikeshed preview external")}</MenuItem>
        <MenuItem onClick={BikeshedDownload}><ListItemIcon><DescriptionTwoToneIcon fontSize="small" /></ListItemIcon>{t("Bikeshed download source")}</MenuItem>
    </>;
})
