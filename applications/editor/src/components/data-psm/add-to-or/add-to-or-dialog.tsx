import {Box, Button, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import React, {memo, useCallback, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {dialog, useDialog} from "../../../dialog";
import {Item} from "../replace-along-inheritance/item";
import {CLASS} from "@dataspecer/core/pim/pim-vocabulary";
import {PimClassDetailDialog} from "../../detail/pim-class-detail-dialog";
import {StoreContext, useNewFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {ConfigurationContext} from "../../App";
import {ReadOnlyMemoryStoreWithDummyPimSchema} from "@dataspecer/federated-observable-store/read-only-memory-store-with-dummy-pim-schema";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {PimClass} from "@dataspecer/core/pim/model";
import {CoreResourceReader} from "@dataspecer/core/core";
import {useAsyncMemo} from "../../../hooks/use-async-memo";
import {getPimHavingInterpretation} from "../../../utils/get-pim-having-interpretation";
import {isPimAncestorOf} from "../../../utils/is-ancestor-of";

export const AddToOrDialog = dialog<{
    // Data Psm class IRI that is going to be replaced by another class.
    typePimClassIri: string,
    onSelected: (pimClassIri: string, pimStore: CoreResourceReader) => void,
}>({maxWidth: "sm", fullWidth: true}, memo(({typePimClassIri, onSelected, close}) => {
    const {t} = useTranslation("psm");

    const previewStore = useNewFederatedObservableStore();

    const {resource: pimResource} = useResource<PimClass>(typePimClassIri);
    const cimIri = pimResource?.pimInterpretation;

    const {cim: {cimAdapter}} = React.useContext(ConfigurationContext);
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

    const select = useCallback(async (iri: string) => {
        if (fullInheritance) {
            onSelected(iri, fullInheritance);
        }
    }, [onSelected, fullInheritance]);

    const [descendantsOrSelf] = useAsyncMemo(async () => {
        if (!fullInheritance || !cimIri) {
            return [];
        }

        const middleClassIri = await getPimHavingInterpretation(fullInheritance, cimIri) as string;

        const descendants: string[] = [];

        const resources = await fullInheritance.listResourcesOfType(CLASS);
        for (const resourceIri of resources) {
            if (await isPimAncestorOf(fullInheritance, middleClassIri, resourceIri)
            || middleClassIri === resourceIri) {
                descendants.push(resourceIri);
            }
        }

        return descendants;
    }, [fullInheritance], []) as [string[], boolean];

    return <>
        <StoreContext.Provider value={previewStore}>
            <DialogTitle>
                {t("add to or dialog.title")}
            </DialogTitle>
            <DialogContent>
                <Box style={{maxHeight: 400, overflow: 'auto'}}>
                    {descendantsOrSelf.map(resource => <Item
                        pimClassIri={resource}
                        onClick={() => select(resource)}
                        onInfo={() => PimClassDetail.open({iri: resource})}
                    />)}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={close}>{t("cancel")}</Button>
            </DialogActions>
            <PimClassDetail.Component />
        </StoreContext.Provider>
    </>
}));
