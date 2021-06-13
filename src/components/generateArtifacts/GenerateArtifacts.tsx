import React, {useCallback, useRef, useState} from "react";
import {Fab, Menu, MenuItem} from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {useToggle} from "../../hooks/useToggle";
import {uniqueId} from "lodash";
import {Store} from "model-driven-data";
import copy from "copy-to-clipboard";
import {useSnackbar} from 'notistack';
import FileSaver from "file-saver";

export const GenerateArtifacts: React.FC<{store: Store}> = ({store}) => {
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

    return (
        <>
            <Fab aria-controls={id} aria-haspopup="true" variant="extended" size="medium" color="primary" onClick={open} ref={ref}>
                Generate artifacts
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
            </Menu>
        </>
    );
};