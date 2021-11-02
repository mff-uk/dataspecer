import React, {memo, ReactElement, useCallback, useEffect, useRef, useState} from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Fab,
    ListItemIcon,
    Menu,
    MenuItem
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {useToggle} from "../../hooks/useToggle";
import {uniqueId} from "lodash";
import {useTranslation} from "react-i18next";
import {GetBikeshedArtifact, GetPreviewBikeshedArtifact} from "./BikeshedArtifact";
import {getObjectModelArtifact, GetPreviewComponentObjectModelArtifact} from "./ObjectModelArtifact";
import {StoreContext} from "../App";
import {GetJsonSchemaArtifact, GetPreviewComponentJsonSchemaArtifact} from "./JsonSchemaArtifact";
import {DialogParameters} from "../dialog-parameters";
import {useDialog} from "../../hooks/useDialog";
import {GetPreviewComponentXsdArtifact, GetXsdArtifact} from "./XsdArtifact";
import FileSaver from "file-saver";
import {getNameForSchema} from "../../utils/getNameForSchema";
import copy from "copy-to-clipboard";
import {useSnackbar} from "notistack";
import {CoreResourceReader} from "model-driven-data/core";
import ContentCopyTwoToneIcon from '@mui/icons-material/ContentCopyTwoTone';
import DownloadTwoToneIcon from '@mui/icons-material/DownloadTwoTone';
import FindInPageTwoToneIcon from '@mui/icons-material/FindInPageTwoTone';

const PreviewDialog: React.FC<DialogParameters & {content: Promise<ReactElement>}> = memo(({content, isOpen, close}) => {
    const [component, setComponent] = useState<ReactElement | null>(null);
    useEffect(() => {
        if (content) {
            setComponent(null);
            content.then(setComponent);
        }
    }, [content]);

    return <Dialog open={isOpen} onClose={close} maxWidth="lg" fullWidth>
        <DialogTitle>
            Preview
        </DialogTitle>
        <DialogContent>
            {component ?? "loading"}
        </DialogContent>
        <DialogActions>
            <Button onClick={close}>Close</Button>
        </DialogActions>
    </Dialog>
});

function useCopyToClipboard() {
    const {psmSchemas, store} = React.useContext(StoreContext);
    const {enqueueSnackbar} = useSnackbar();
    const {t} = useTranslation("artifacts");
    return useCallback(async (getArtifact: (store: CoreResourceReader, schema: string) => Promise<string>) => {
        if (copy(await getArtifact(store, psmSchemas[0]))) {
            enqueueSnackbar(t("snackbar copied to clipboard.ok"), {variant: "success"});
        } else {
            enqueueSnackbar(t("snackbar copied to clipboard.failed"), {variant: "error"});
        }
    }, []);
}

function useSaveToFile() {
    const {psmSchemas, store} = React.useContext(StoreContext);
    const {i18n} = useTranslation("artifacts");
    return useCallback(async (getArtifact: (store: CoreResourceReader, schema: string) => Promise<string>, extension: string, mime: string) => {
        const artifact = await getArtifact(store, psmSchemas[0]);
        const name = await getNameForSchema(store, psmSchemas[0], i18n.languages);
        const data = new Blob([artifact], {type: mime});
        FileSaver.saveAs(data, name + "." + extension, {autoBom: false});
    }, []);
}


export const GenerateArtifacts: React.FC = () => {
    const {isOpen, open, close} = useToggle();
    const [ id ] = useState(() => uniqueId());
    const ref = useRef(null);
    const {t} = useTranslation("artifacts");
    const {psmSchemas, store} = React.useContext(StoreContext);

    const Preview = useDialog(PreviewDialog, ["content"]);

    const copy = useCopyToClipboard();
    const save = useSaveToFile();

    return (
        <>
            <Fab aria-controls={id} aria-haspopup="true" variant="extended" size="medium" color="primary" onClick={open} ref={ref} disabled={psmSchemas.length === 0}>
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
                <MenuItem disabled style={{opacity: 1, fontWeight: "bold"}}>Bikeshed</MenuItem>
                <Box sx={{display: "flex"}}>
                    <MenuItem onClick={() => save(GetBikeshedArtifact, "bs", "text/bs;charset=utf-8")}>
                        <ListItemIcon><DownloadTwoToneIcon fontSize="small" /></ListItemIcon>
                        {t("download")}
                    </MenuItem>
                    <MenuItem onClick={() => {
                        GetPreviewBikeshedArtifact(store, psmSchemas[0])
                    }}><ListItemIcon><FindInPageTwoToneIcon fontSize="small" /></ListItemIcon>{t("preview")}</MenuItem>
                    <MenuItem onClick={() => copy(GetBikeshedArtifact)}>
                        <ListItemIcon><ContentCopyTwoToneIcon fontSize="small" /></ListItemIcon>
                        {t("copy")}
                    </MenuItem>
                </Box>

                <Divider />

                <MenuItem disabled style={{opacity: 1, fontWeight: "bold"}}>Object-model</MenuItem>
                <Box sx={{display: "flex"}}>
                    <MenuItem onClick={() => save(getObjectModelArtifact, "json", "text/json;charset=utf-8")}>
                        <ListItemIcon><DownloadTwoToneIcon fontSize="small" /></ListItemIcon>
                        {t("download")}
                    </MenuItem>
                    <MenuItem onClick={() => {
                        Preview.open({content: GetPreviewComponentObjectModelArtifact(store, psmSchemas[0])});
                    }}><ListItemIcon><FindInPageTwoToneIcon fontSize="small" /></ListItemIcon>{t("preview")}</MenuItem>
                    <MenuItem onClick={() => copy(getObjectModelArtifact)}>
                        <ListItemIcon><ContentCopyTwoToneIcon fontSize="small" /></ListItemIcon>
                        {t("copy")}
                    </MenuItem>
                </Box>

                <Divider />

                <MenuItem disabled style={{opacity: 1, fontWeight: "bold"}}>JSON schema</MenuItem>
                <Box sx={{display: "flex"}}>
                    <MenuItem onClick={() => save(GetJsonSchemaArtifact, "json", "text/json;charset=utf-8")}>
                        <ListItemIcon><DownloadTwoToneIcon fontSize="small" /></ListItemIcon>
                        {t("download")}
                    </MenuItem>
                    <MenuItem onClick={() => {
                        Preview.open({content: GetPreviewComponentJsonSchemaArtifact(store, psmSchemas[0])});
                    }}><ListItemIcon><FindInPageTwoToneIcon fontSize="small" /></ListItemIcon>{t("preview")}</MenuItem>
                    <MenuItem onClick={() => copy(GetJsonSchemaArtifact)}>
                        <ListItemIcon><ContentCopyTwoToneIcon fontSize="small" /></ListItemIcon>
                        {t("copy")}
                    </MenuItem>
                </Box>

                <Divider />

                <MenuItem disabled style={{opacity: 1, fontWeight: "bold"}}>XSD</MenuItem>
                <Box sx={{display: "flex"}}>
                    <MenuItem onClick={() => save(GetXsdArtifact, "xsd", "text/xml;charset=utf-8")}>
                        <ListItemIcon><DownloadTwoToneIcon fontSize="small" /></ListItemIcon>
                        {t("download")}
                    </MenuItem>
                    <MenuItem onClick={() => {
                        Preview.open({content: GetPreviewComponentXsdArtifact(store, psmSchemas[0])});
                    }}><ListItemIcon><FindInPageTwoToneIcon fontSize="small" /></ListItemIcon>{t("preview")}</MenuItem>
                    <MenuItem onClick={() => copy(GetXsdArtifact)}>
                        <ListItemIcon><ContentCopyTwoToneIcon fontSize="small" /></ListItemIcon>
                        {t("copy")}
                    </MenuItem>
                </Box>

            </Menu>

            <Preview.component />
        </>
    );
};
