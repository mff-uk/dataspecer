import {Alert, Box, Button, DialogActions, DialogContent, DialogTitle, ListItem} from "@mui/material";
import React, {memo, useCallback, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {dialog, useDialog} from "../../../dialog";
import {useAsyncMemo} from "../../../hooks/use-async-memo";
import {CLASS} from "@dataspecer/core/pim/pim-vocabulary";
import {isPimAncestorOf} from "../../../utils/is-ancestor-of";
import {getPimHavingInterpretation} from "../../../utils/get-pim-having-interpretation";
import {PimClassDetailDialog} from "../../detail/pim-class-detail-dialog";
import {StoreContext, useFederatedObservableStore, useNewFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {ConfigurationContext} from "../../App";
import {ReadOnlyMemoryStoreWithDummyPimSchema} from "@dataspecer/federated-observable-store/read-only-memory-store-with-dummy-pim-schema";
import {useDataPsmAndInterpretedPim} from "../../../hooks/use-data-psm-and-interpreted-pim";
import {Item} from "../replace-along-inheritance/item";
import {AddSpecialization} from "../../../operations/add-specialization";

export const AddSpecializationDialog = dialog<{
    dataPsmClassIri: string,
    wrappedOrIri?: string,
}>({maxWidth: "md", fullWidth: true}, memo(({dataPsmClassIri, close, wrappedOrIri}) => {
    const {t} = useTranslation("psm");

    const store = useFederatedObservableStore();
    const previewStore = useNewFederatedObservableStore();

    const {pimResource} = useDataPsmAndInterpretedPim(dataPsmClassIri);
    const cimIri = pimResource?.pimInterpretation;

    const {cim: {cimAdapter}, operationContext} = React.useContext(ConfigurationContext);
    const [fullInheritance] = useAsyncMemo(async () => cimIri ? await cimAdapter.getFullHierarchy(cimIri) : null, [cimIri]);

    const PimClassDetail = useDialog(PimClassDetailDialog);

    // Register new store into the context
    useEffect(() => {
        if (fullInheritance) {
            const wrappedStore = new ReadOnlyMemoryStoreWithDummyPimSchema(fullInheritance, "http://dummy-schema/");
            previewStore.addStore(wrappedStore);
            return () => previewStore.removeStore(wrappedStore);
        }
    }, [fullInheritance, previewStore]);

    const [descendants] = useAsyncMemo(async () => {
        if (!fullInheritance || !cimIri) {
            return [];
        }

        const middleClassIri = await getPimHavingInterpretation(fullInheritance, cimIri) as string;

        const descendants: string[] = [];

        const resources = await fullInheritance.listResourcesOfType(CLASS);
        for (const resourceIri of resources) {
            if (await isPimAncestorOf(fullInheritance, middleClassIri, resourceIri)) {
                descendants.push(resourceIri);
            }
        }

        return descendants;
    }, [fullInheritance], []) as [string[], boolean];

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
        <StoreContext.Provider value={previewStore}>
            <DialogTitle>
                {t("add specialization.title")}
            </DialogTitle>
            <DialogContent>
                <Alert severity="info">{t("add specialization.help")}</Alert>
                <Box sx={{maxHeight: 400, overflow: 'auto', mt: 3}}>
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
            </DialogContent>
            <DialogActions>
                <Button onClick={close}>{t("cancel")}</Button>
            </DialogActions>
            <PimClassDetail.Component />
        </StoreContext.Provider>
    </>
}));
