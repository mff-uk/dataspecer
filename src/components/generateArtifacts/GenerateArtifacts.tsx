import React, {useCallback, useRef, useState} from "react";
import {Divider, Fab, ListItemIcon, Menu, MenuItem} from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {useToggle} from "../../hooks/useToggle";
import {uniqueId} from "lodash";
import {Store} from "model-driven-data";
import copy from "copy-to-clipboard";
import {useSnackbar} from 'notistack';
import FileSaver from "file-saver";
import fileDialog from "file-dialog";
import {useTranslation} from "react-i18next";
import SaveTwoToneIcon from '@material-ui/icons/SaveTwoTone';
import AssignmentTwoToneIcon from '@material-ui/icons/AssignmentTwoTone';
import OpenInBrowserTwoToneIcon from '@material-ui/icons/OpenInBrowserTwoTone';
import {ReSpecArtifact} from "./ReSpecArtifact";

export const GenerateArtifacts: React.FC<{store: Store, setStore: (store: Store) => void}> = ({store, setStore}) => {
    const {isOpen, open, close} = useToggle();
    const [ id ] = useState(() => uniqueId());
    const ref = useRef(null);
    const { enqueueSnackbar } = useSnackbar();
    const {t} = useTranslation("artifacts");

    const storeToClipboard = useCallback(() => {
        close();
        if (copy(JSON.stringify(store))) {
            enqueueSnackbar(t("snackbar copied to clipboard.ok"), {variant: "success"});
        } else {
            enqueueSnackbar(t("snackbar copied to clipboard.failed"), {variant: "error"});
        }
        }, [close, store, enqueueSnackbar, t]);

    const saveToFile = useCallback(() => {
        close();
        const data = new Blob([JSON.stringify(store)], {type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(data, "platform-model.json", {autoBom: false});
    }, [close, store]);

    const fileToStore = useCallback(async () => {
        close();
        const files = await fileDialog();
        if (files.length) {
            try {
                const file = files[0];
                const text = await file.text();
                const result = JSON.parse(text) as Store;
                setStore(result);
                enqueueSnackbar(t("snackbar load.ok"), {variant: "success"});
            } catch (e) {
                enqueueSnackbar(t("snackbar load.fail"), {variant: "error"});
            }
        }
    }, [close, enqueueSnackbar, setStore, t]);

    return (
        <>
            <Fab aria-controls={id} aria-haspopup="true" variant="extended" size="medium" color="primary" onClick={open} ref={ref}>
                {t("button generate load artifacts")}
                <ExpandMoreIcon />
            </Fab>
            <Menu
                id={id}
                anchorEl={ref.current}
                keepMounted
                open={isOpen}
                onClose={close}
            >
                <MenuItem onClick={saveToFile}><ListItemIcon><SaveTwoToneIcon fontSize="small" /></ListItemIcon>{t("platform-model JSON as file")}</MenuItem>
                <MenuItem onClick={storeToClipboard}><ListItemIcon><AssignmentTwoToneIcon fontSize="small" /></ListItemIcon>{t("platform-model JSON to clipboard")}</MenuItem>
                <Divider />
                <MenuItem onClick={fileToStore}><ListItemIcon><OpenInBrowserTwoToneIcon fontSize="small" /></ListItemIcon>{t("import platform-model JSON")}</MenuItem>
                <Divider />
                <ReSpecArtifact store={store} close={close} />
            </Menu>
        </>
    );
};
