import React, {FC, useCallback, useContext} from "react";
import {dialog} from "../../editor/dialog";
import {Button, DialogActions, DialogContent, DialogTitle, Typography} from "@mui/material";
import {CloseDialogButton} from "../../editor/components/detail/components/close-dialog-button";
import {useTranslation} from "react-i18next";
import {DataSpecificationsContext} from "../app";
import {BackendConnectorContext} from "../../application";
import {DataSchemaNameCell} from "../name-cells";

export const DeleteDataSchemaForm: FC<{
    isOpen: boolean,
    close: () => void,
    dataSpecificationIri: string,
    dataStructureIri: string,
}> = dialog({fullWidth: true, maxWidth: "xs"}, ({close, dataSpecificationIri, dataStructureIri}) => {
    const {t} = useTranslation("ui");

    const {
        dataSpecifications,
        setDataSpecifications,
    } = useContext(DataSpecificationsContext);
    const backendConnector = useContext(BackendConnectorContext);

    const del = useCallback(async () => {
        await backendConnector.deleteDataStructure(dataSpecificationIri, dataStructureIri);
        setDataSpecifications({
            ...dataSpecifications,
            [dataSpecificationIri]: {
                ...dataSpecifications[dataSpecificationIri],
                psms: dataSpecifications[dataSpecificationIri].psms.filter(psm => psm !== dataStructureIri),
                psmStores: Object.fromEntries(
                    Object.entries(dataSpecifications[dataSpecificationIri].psmStores).filter(([psmIri, storeInfo]) => psmIri !== dataStructureIri)
                ),
            }
        });
        close();
    }, [backendConnector, dataSpecificationIri, dataStructureIri, setDataSpecifications, dataSpecifications, close]);

    return <>
        <DialogTitle>
            {t("deleteDataSchema.title")}
            <CloseDialogButton onClick={close} />
        </DialogTitle>
        <DialogContent>
            <Typography>
                {t("deleteDataSchema.text")}
            </Typography>
            <ul>
                <li>
                    <DataSchemaNameCell dataPsmSchemaIri={dataStructureIri} />
                </li>
            </ul>
            <Typography>
                {t("deleteDataSchema.additionalText")}
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={del} color="error">{t("delete")}</Button>
            <Button onClick={close} variant="contained">{t("cancel")}</Button>
        </DialogActions>
    </>;
});
