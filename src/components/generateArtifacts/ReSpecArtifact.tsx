import React, {useCallback} from "react";
import {ListItemIcon, MenuItem} from "@material-ui/core";
import FindInPageTwoToneIcon from "@material-ui/icons/FindInPageTwoTone";
import DescriptionTwoToneIcon from "@material-ui/icons/DescriptionTwoTone";
import FileSaver from "file-saver";
import {getReSpec, loadEntitySchemaFromIri, schemaAsReSpec, Store} from "model-driven-data";
import {useSnackbar} from "notistack";
import {useTranslation} from "react-i18next";

export const ReSpecArtifact: React.FC<{store: Store, close: () => void}> = ({store, close}) => {
    const { enqueueSnackbar } = useSnackbar();
    const {t} = useTranslation("artifacts");

    const generateReSpec = useCallback(() => {
        try {
            const schema = loadEntitySchemaFromIri(store, "__root_schema");
            const actual = schemaAsReSpec(schema);
            return getReSpec(actual);
        } catch (_) {
            enqueueSnackbar(t("snackbar ReSpec.fail"), {variant: "error"});
        }
        return false;
    }, [enqueueSnackbar, store, t]);

    const ReSpecPreview = useCallback(() => {
        close();
        const reSpec = generateReSpec();

        if (reSpec) {
            const win = window.open("", "ReSpec documentation", "resizable,scrollbars,status");
            if (win) {
                win.document.write(reSpec);
                win.document.close();
            }
        }
    }, [close, generateReSpec]);

    const ReSpecDownload = useCallback(() => {
        close();
        const reSpec = generateReSpec();
        if (reSpec) {
            const data = new Blob([reSpec], {type: "text/html;charset=utf-8"});
            FileSaver.saveAs(data, "ReSpec.html", {autoBom: false});
        }
    }, [close, generateReSpec]);

    return <>
        <MenuItem onClick={ReSpecPreview}><ListItemIcon><FindInPageTwoToneIcon fontSize="small" /></ListItemIcon>{t("ReSpec preview")}</MenuItem>
        <MenuItem onClick={ReSpecDownload}><ListItemIcon><DescriptionTwoToneIcon fontSize="small" /></ListItemIcon>{t("ReSpec download")}</MenuItem>
    </>;
}
