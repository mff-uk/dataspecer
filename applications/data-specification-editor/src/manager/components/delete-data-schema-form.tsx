import { Button, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { FC, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { BackendConnectorContext } from "../../application";
import { CloseDialogButton } from "../../editor/components/detail/components/close-dialog-button";
import { dialog } from "../../editor/dialog";
import { DataSpecificationsContext } from "../app";
import { DataSchemaNameCell } from "../name-cells";

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
    const backendPackageService = useContext(BackendConnectorContext);

    const del = useCallback(async () => {
        await backendPackageService.deleteResource(dataStructureIri);
        setDataSpecifications({
            ...dataSpecifications,
            [dataSpecificationIri]: {
                ...dataSpecifications[dataSpecificationIri],
                dataStructures: dataSpecifications[dataSpecificationIri].dataStructures.filter(structure => structure.id !== dataStructureIri),
            }
        });
        close();
    }, [backendPackageService, dataSpecificationIri, dataStructureIri, setDataSpecifications, dataSpecifications, close]);

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
