import React, {useCallback, useRef, useState} from "react";
import {Fab, Menu, MenuItem} from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {useToggle} from "../../hooks/useToggle";
import {uniqueId} from "lodash";
import {Store} from "model-driven-data";
import copy from "copy-to-clipboard";
import {useSnackbar} from 'notistack';
import FileSaver from "file-saver";
import fileDialog from "file-dialog";

export const GenerateArtifacts: React.FC<{store: Store, setStore: (store: Store) => void}> = ({store, setStore}) => {
    const {isOpen, open, close} = useToggle();
    const [ id ] = useState(() => uniqueId())
    const ref = useRef(null);
    const { enqueueSnackbar } = useSnackbar();

    const storeToClipboard = useCallback(() => {
        close();
        if (copy(JSON.stringify(store))) {
            enqueueSnackbar("Copied to clipboard", {variant: "success"});
        } else {
            enqueueSnackbar("Unable to copy to clipboard", {variant: "error"});
        }
        }, [close, store, enqueueSnackbar]);

    const saveToFile = useCallback(() => {
        close();
        const data = new Blob([JSON.stringify(store)], {type: "text/plain;charset=utf-8"})
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
                enqueueSnackbar("Platform-model data loaded successfully", {variant: "success"});
            } catch (e) {
                enqueueSnackbar("Unable to load saved platform-model", {variant: "error"});
            }
        }
    }, [enqueueSnackbar, setStore]);

    return (
        <>
            <Fab aria-controls={id} aria-haspopup="true" variant="extended" size="medium" color="primary" onClick={open} ref={ref}>
                Generate/Load artifacts
                <ExpandMoreIcon />
            </Fab>
            <Menu
                id={id}
                anchorEl={ref.current}
                keepMounted
                open={isOpen}
                onClose={close}
            >
                <MenuItem onClick={saveToFile}>platform-model JSON as file</MenuItem>
                <MenuItem onClick={storeToClipboard}>platform-model JSON to clipboard</MenuItem>
                <MenuItem onClick={fileToStore}>import platform-model JSON</MenuItem>
            </Menu>
        </>
    );
};