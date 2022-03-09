import {Alert, Box, Button, DialogActions, DialogContent, DialogTitle, Grid, ListItem, Typography} from "@mui/material";
import React, {memo, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {dialog, useDialog} from "../../../dialog";
import {StoreContext} from "../../App";
import {useAsyncMemo} from "../../../hooks/useAsyncMemo";
import {useDataPsmAndInterpretedPim} from "../../../hooks/useDataPsmAndInterpretedPim";
import {Item} from "./item";
import {FederatedObservableStore, StoreWithMetadata} from "../../../store/federated-observable-store";
import {CLASS} from "@model-driven-data/core/pim/pim-vocabulary";
import {isPimAncestorOf} from "../../../store/utils/is-ancestor-of";
import {getPimHavingInterpretation} from "../../../store/utils/get-pim-having-interpretation";
import {ReplaceAlongInheritance} from "../../../operations/replace-along-inheritance";
import {PimClassDetailDialog} from "../../detail/pim-class-detail-dialog";
import {Store} from "@mui/icons-material";

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
    const {t, i18n} = useTranslation("psm");

    // Replace store context
    const storeContext = useContext(StoreContext);
    const [store] = useState(() => new FederatedObservableStore());
    const NewStoreContext = useMemo(() => ({...storeContext, store}), [storeContext, store]);

    const {pimResource} = useDataPsmAndInterpretedPim(dataPsmClassIri);
    const cimIri = pimResource?.pimInterpretation;

    const {cim: {cimAdapter}} = React.useContext(StoreContext);
    const [fullInheritance] = useAsyncMemo(async () => cimIri ? await cimAdapter.getFullHierarchy(cimIri) : null, [cimIri]);

    const PimClassDetail = useDialog(PimClassDetailDialog);

    // Register new store into the context
    useEffect(() => {
        if (fullInheritance) {
            const storeWithMetadata = {
                store: fullInheritance,
                metadata: {
                    tags: ["cim-as-pim", "read-only"]
                },
            } as StoreWithMetadata;
            store.addStore(storeWithMetadata);
            return () => store.removeStore(storeWithMetadata);
        }
    }, [fullInheritance, store]);

    const [[ancestors, descendants]] = useAsyncMemo(async () => {
        if (!fullInheritance || !cimIri) {
            return [[],[]];
        }

        const middleClassIri = await getPimHavingInterpretation(fullInheritance, cimIri) as string;

        const ancestors: string[] = [];
        const descendants: string[] = [];

        const resources = await fullInheritance.listResourcesOfType(CLASS);
        for (const resourceIri of resources) {
            if (await isPimAncestorOf(fullInheritance, middleClassIri, resourceIri)) {
                descendants.push(resourceIri);
            } else if (await isPimAncestorOf(fullInheritance, resourceIri, middleClassIri)) {
                ancestors.push(resourceIri);
            }
        }

        return [ancestors, descendants];
    }, [fullInheritance], [[],[]]) as [[string[], string[]], boolean];

    const onSelected = useCallback((selectedPimIriFromStore: string) => {
        if (!fullInheritance) {
            return;
        }

        const replaceOperation = new ReplaceAlongInheritance(
            dataPsmClassIri,
            selectedPimIriFromStore,
            fullInheritance
        );
        replaceOperation.labelRules = {
            languages: i18n.languages as string[],
            namingConvention: "snake_case",
            specialCharacters: "allow",
        };
        storeContext.store.executeOperation(replaceOperation).then();
        close();
    }, [i18n.languages, storeContext.store, fullInheritance, dataPsmClassIri, close]);

    return <>
        <StoreContext.Provider value={NewStoreContext}>
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
                                pimClassIri={resource}
                                onClick={() => onSelected(resource)}
                                onInfo={() => PimClassDetail.open({iri: resource})}
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
                                pimClassIri={resource}
                                onClick={() => onSelected(resource)}
                                onInfo={() => PimClassDetail.open({iri: resource})}
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
