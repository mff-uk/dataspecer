import { isSemanticModelClass, SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { useFederatedObservableStore } from "@dataspecer/federated-observable-store-react/store";
import { Alert, Box, Button, DialogActions, DialogContent, DialogTitle, ListItem } from "@mui/material";
import React, { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { dialog, useDialog } from "../../../dialog";
import { useAsyncMemo } from "../../../hooks/use-async-memo";
import { useDataPsmAndInterpretedPim } from "../../../hooks/use-data-psm-and-interpreted-pim";
import { AddSpecialization } from "../../../operations/add-specialization";
import { isAncestorOf } from "../../../utils/is-ancestor-of";
import { ConfigurationContext } from "../../App";
import { PimClassDetailDialog } from "../../detail/pim-class-detail-dialog";
import { Item } from "../replace-along-inheritance/item";

export const AddSpecializationDialog = dialog<{
    // For which PSM entity is the action performed
    dataPsmClassIri: string,
    // Whether the parent is already wrapped in OR - then it is the IRI of the OR
    wrappedOrIri?: string,
}>({maxWidth: "md", fullWidth: true}, memo(({dataPsmClassIri, close, wrappedOrIri}) => {
    const {t} = useTranslation("psm");

    const store = useFederatedObservableStore();

    const {pimResource} = useDataPsmAndInterpretedPim(dataPsmClassIri);
    const cimIri = pimResource?.pimInterpretation;

    const {sourceSemanticModel, operationContext} = React.useContext(ConfigurationContext);
    const [fullInheritance] = useAsyncMemo(async () => cimIri ? await sourceSemanticModel.getFullHierarchy(cimIri) : null, [cimIri]);

    const PimClassDetail = useDialog(PimClassDetailDialog);

    const [descendants] = useAsyncMemo(async () => {
        if (!fullInheritance || !cimIri) {
            return [];
        }

        const middleClassIri = cimIri;

        const descendants: SemanticModelClass[] = [];

        for (const resource of fullInheritance.filter(isSemanticModelClass)) {
            if (await isAncestorOf(fullInheritance, middleClassIri, resource.id)) {
                descendants.push(resource);
            }
        }

        return descendants;
    }, [fullInheritance], []) as [SemanticModelClass[], boolean];

    const onSelected = useCallback((selectedPimIriFromStore: string) => {
        if (!fullInheritance) {
            return;
        }

        const operation = new AddSpecialization(
            dataPsmClassIri,
            wrappedOrIri,
            selectedPimIriFromStore,
            fullInheritance
        );
        operation.setContext(operationContext);
        store.executeComplexOperation(operation).then();
        close();
    }, [fullInheritance, dataPsmClassIri, wrappedOrIri, operationContext, store, close]);

    return <>
        <DialogTitle>
            {t("add specialization.title")}
        </DialogTitle>
        <DialogContent>
            <Alert severity="info">{t("add specialization.help")}</Alert>
            <Box sx={{maxHeight: 400, overflow: 'auto', mt: 3}}>
                {descendants.map(resource => <Item
                    semanticModelClass={resource}
                    onClick={() => onSelected(resource.id)}
                    onInfo={() => PimClassDetail.open({iri: resource.id})}
                />)}
                {descendants.length === 0 &&
                    <ListItem disabled>
                        <i>{t("specialization.no-descendants")}</i>
                    </ListItem>
                }
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={close}>{t("cancel")}</Button>
        </DialogActions>
        <PimClassDetail.Component />
    </>
}));
