import {dialog} from "../../editor/dialog";
import {DialogContent, DialogTitle} from "../../editor/components/detail/common";
import React, {ChangeEvent, useContext, useMemo, useState} from "react";
import {DialogActions, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {styled} from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import JSZip from "jszip";
import {DataSpecifications} from "../data-specifications";
import {CoreResource} from "@dataspecer/core/core";
import {useSnackbar} from "notistack";
import {SelectionWindow} from "./selectionWindow";
import {BackendConnectorContext, RefreshContext} from "../../application";
import {DataSpecificationsContext} from "../app";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export type ImportData = {
    mergedStore: Record<string, CoreResource>,
    dataSpecifications: DataSpecifications,
}


export const ImportDialog = dialog({fullWidth: true, maxWidth: "md"}, (props) => {
    const {t} = useTranslation("ui", {keyPrefix: 'import'});
    const [importData, setImportData] = useState<ImportData | null>(null);
    const {dataSpecifications: localDS} = useContext(DataSpecificationsContext);

    const [dataSpecificationsToImport, setDataSpecificationsToImport] = useState<string[]>([]);

    /**
     * Specifications that needs to be included or must exist
     */
    const requiredSpecifications = useMemo(() => {
        const required = new Set<string>();

        const process = (specification: string) =>  {
            if (required.has(specification)) {
                return;
            }
            required.add(specification);

            const dataSpecification = importData?.dataSpecifications[specification];
            dataSpecification?.importsDataSpecifications.forEach(process);
        }

        dataSpecificationsToImport.forEach(process);
        
        return [...required];
    }, [dataSpecificationsToImport, importData?.dataSpecifications]);

    /**
     * Minimal set that will be imported
     */
    const minimalSetSpecification = useMemo(() => {
        const specifications = new Set<string>(dataSpecificationsToImport);

        for (const req of requiredSpecifications) {
            if (!localDS[req]) {
                specifications.add(req);
            }
        }

        return [...specifications];
    }, [localDS, requiredSpecifications, dataSpecificationsToImport]);


    const backendConnector = useContext(BackendConnectorContext);

    const {enqueueSnackbar} = useSnackbar();
    const refresh = useContext(RefreshContext);
    const importAction = async () => {
        const importRequest = Object.fromEntries(minimalSetSpecification.map(iri => [iri, "AS-IS"]));
        await backendConnector.importSpecifications(importData.dataSpecifications, importRequest, importData.mergedStore);
        enqueueSnackbar(t("imported message"), {variant: "success"});
        props.close();
        refresh();
    }

    return <>
        <DialogTitle id="customized-dialog-title" close={props.close}>
            {t("title")}
        </DialogTitle>
        <DialogContent dividers>
            {importData === null && <DropWindow setImportData={setImportData} />}
            {importData !== null && <SelectionWindow
                importData={importData}
                dataSpecificationsToImport={dataSpecificationsToImport}
                setDataSpecificationsToImport={setDataSpecificationsToImport}
                requiredSpecifications={requiredSpecifications}
            />}
        </DialogContent>
        <DialogActions>
            {importData !== null && <Button onClick={importAction}>{t("import")} ({minimalSetSpecification.length})</Button>}
            <Button onClick={props.close}>{t("close button")}</Button>
        </DialogActions>
    </>;
});

const DropWindow = ({setImportData}: {setImportData: (data: ImportData) => void}) => {
    const {enqueueSnackbar} = useSnackbar();
    const {t} = useTranslation("ui", {keyPrefix: 'import'});

    const uploaded = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            try {
                const zip = new JSZip();
                const content = await zip.loadAsync(file);
                const mergedStoreString = await content.file("resources/merged_store.json")?.async("string");
                const dataSpecificationsString = await content.file("resources/data_specifications.json")?.async("string");
                const mergedStore = JSON.parse(mergedStoreString);
                const dataSpecifications = JSON.parse(dataSpecificationsString);
                setImportData({mergedStore, dataSpecifications});
            } catch (e) {
                enqueueSnackbar(t("unable to read file"), {variant: "error"});
                e.target.value = "";
            }
        }
    }

    return <>
        <Typography>
            {t("upload info")}
        </Typography>
        <div style={{textAlign: "center", marginTop: "1rem"}}>
            <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
                {t("upload file")}
                <VisuallyHiddenInput type="file" onChange={e => uploaded(e)} />
            </Button>
        </div>
    </>;
}

