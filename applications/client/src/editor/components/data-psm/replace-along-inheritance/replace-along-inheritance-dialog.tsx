import { isSemanticModelClass, SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { StoreContext, useFederatedObservableStore, useNewFederatedObservableStore } from "@dataspecer/federated-observable-store-react/store";
import { Alert, Box, Button, DialogActions, DialogContent, DialogTitle, Grid, ListItem, Typography } from "@mui/material";
import React, { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { dialog, useDialog } from "../../../dialog";
import { useAsyncMemo } from "../../../hooks/use-async-memo";
import { useDataPsmAndInterpretedPim } from "../../../hooks/use-data-psm-and-interpreted-pim";
import { ReplaceAlongInheritance } from "../../../operations/replace-along-inheritance";
import { isAncestorOf } from "../../../utils/is-ancestor-of";
import { ConfigurationContext } from "../../App";
import { PimClassDetailDialog } from "../../detail/pim-class-detail-dialog";
import { Item } from "./item";

/**
 * This dialog prompts the user to select one class, descendant or ancestor of
 * the selected class, that will replace the selected class.
 *
 * The component itself has already the logic to replace the selected class.
 * The caller is responsible only to show the dialog with the correct selected
 * class.
 */
export const ReplaceAlongInheritanceDialog = dialog<{
    // Data Psm class IRI that is going to be replaced by another class.
    dataPsmClassIri: string,
}>({maxWidth: "md", fullWidth: true}, memo(({dataPsmClassIri, close}) => {
    const {t} = useTranslation("psm");

    const store = useFederatedObservableStore();
    const previewStore = useNewFederatedObservableStore();

    const {pimResource} = useDataPsmAndInterpretedPim(dataPsmClassIri);
    const cimIri = pimResource?.pimInterpretation;

    const {operationContext, sourceSemanticModel} = React.useContext(ConfigurationContext);
    const [fullInheritance] = useAsyncMemo(async () => cimIri ? await sourceSemanticModel.getFullHierarchy(cimIri) : null, [cimIri, sourceSemanticModel]);

    const PimClassDetail = useDialog(PimClassDetailDialog);

    const [[ancestors, descendants]] = useAsyncMemo(async () => {
        if (!fullInheritance || !cimIri) {
            return [[],[]];
        }

        const middleClassIri = cimIri;

        const ancestors: SemanticModelClass[] = [];
        const descendants: SemanticModelClass[] = [];

        const resources = fullInheritance.filter(isSemanticModelClass);
        for (const resource of resources) {
            if (await isAncestorOf(fullInheritance, middleClassIri, resource.id)) {
                descendants.push(resource);
            } else if (await isAncestorOf(fullInheritance, resource.id, middleClassIri)) {
                ancestors.push(resource);
            }
        }

        return [ancestors, descendants];
    }, [fullInheritance], [[],[]]) as [[SemanticModelClass[], SemanticModelClass[]], boolean];

    const onSelected = useCallback((selectedPimIriFromStore: string) => {
        if (!fullInheritance) {
            return;
        }

        const replaceOperation = new ReplaceAlongInheritance(
            dataPsmClassIri,
            selectedPimIriFromStore,
            fullInheritance
        );
        replaceOperation.setContext(operationContext);
        store.executeComplexOperation(replaceOperation).then();
        close();
    }, [operationContext, store, fullInheritance, dataPsmClassIri, close]);

    return <>
        <StoreContext.Provider value={previewStore}>
            <DialogTitle>
                {t("replace along inheritance.title")}
            </DialogTitle>
            <DialogContent>
                <Alert severity="info">{t("replace along inheritance.help")}</Alert>
                <Grid container spacing={3} sx={{mt: 0}}>
                    <Grid item xs={6}>
                        <Typography variant="h5" gutterBottom component="div">
                            {t("generalization.title")}
                        </Typography>

                        <Box style={{maxHeight: 400, overflow: 'auto'}}>
                            {ancestors.map(resource => <Item
                                semanticModelClass={resource}
                                onClick={() => onSelected(resource.id)}
                                onInfo={() => PimClassDetail.open({iri: resource.id})}
                            />)}
                            {ancestors.length === 0 &&
                                <Typography variant="body2" gutterBottom>
                                    {t("generalization.no-ancestors")}
                                </Typography>
                            }
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h5" gutterBottom component="div">
                            {t("specialization.title")}
                        </Typography>

                        <Box style={{maxHeight: 400, overflow: 'auto'}}>
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
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={close}>{t("cancel")}</Button>
            </DialogActions>
            <PimClassDetail.Component />
        </StoreContext.Provider>
    </>
}));
