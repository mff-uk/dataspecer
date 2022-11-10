import React, {FC, useCallback, useContext} from "react";
import {dialog} from "../../editor/dialog";
import {Button, DialogActions, DialogContent, DialogTitle, Typography} from "@mui/material";
import {CloseDialogButton} from "../../editor/components/detail/components/close-dialog-button";
import {useTranslation} from "react-i18next";
import {DataSpecificationsContext} from "../app";
import {BackendConnectorContext} from "../../application";
import {DataSpecificationNameCell} from "../name-cells";

export const DeleteDataSpecificationForm: FC<{
    isOpen: boolean,
    close: () => void,
    dataSpecificationIris: string[],
}> = dialog({fullWidth: true, maxWidth: "xs"}, ({close, dataSpecificationIris}) => {
    const {t} = useTranslation("ui");

    const {
        dataSpecifications,
        setDataSpecifications,
        rootDataSpecificationIris,
        setRootDataSpecificationIris
    } = useContext(DataSpecificationsContext);
    const backendConnector = useContext(BackendConnectorContext);

    const del = useCallback(async () => {
        const newDataSpecifications = {...dataSpecifications};
        for (const iri of dataSpecificationIris) {
            await backendConnector.deleteDataSpecification(iri);
            delete newDataSpecifications[iri];
        }
        setDataSpecifications(newDataSpecifications);
        setRootDataSpecificationIris(rootDataSpecificationIris.filter(iri => !dataSpecificationIris.includes(iri)));
        close();
    }, [backendConnector, dataSpecificationIris, dataSpecifications, setDataSpecifications, setRootDataSpecificationIris, rootDataSpecificationIris]);

    return <>
        <DialogTitle>
            {t("deleteDataSpecification.title", {count: dataSpecificationIris.length})}
            <CloseDialogButton onClick={close} />
        </DialogTitle>
        <DialogContent>
            <Typography>
                {t("deleteDataSpecification.text", {count: dataSpecificationIris.length})}
            </Typography>
            <ul>
                {dataSpecificationIris.map(iri => <li key={iri}>
                    <DataSpecificationNameCell dataSpecificationIri={iri} />
                </li>)}
            </ul>
            <Typography>
                {t("deleteDataSpecification.additionalText")}
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={del} color="error">{t("delete")}</Button>
            <Button onClick={close} variant="contained">{t("cancel")}</Button>
        </DialogActions>
    </>;
});
