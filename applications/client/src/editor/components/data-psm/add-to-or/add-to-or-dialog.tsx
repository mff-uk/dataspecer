import { isSemanticModelClass, SemanticModelClass, SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";
import { PimClass } from "@dataspecer/core/pim/model";
import { useResource } from "@dataspecer/federated-observable-store-react/use-resource";
import { Box, Button, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import React, { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { dialog, useDialog } from "../../../dialog";
import { useAsyncMemo } from "../../../hooks/use-async-memo";
import { isAncestorOf } from "../../../utils/is-ancestor-of";
import { ConfigurationContext } from "../../App";
import { PimClassDetailDialog } from "../../detail/pim-class-detail-dialog";
import { Item } from "../replace-along-inheritance/item";

export const AddToOrDialog = dialog<{
    // Data Psm class IRI that is going to be replaced by another class.
    typePimClassIri: string,
    onSelected: (pimClassIri: string, sourceSemanticModel: SemanticModelEntity[]) => void,
}>({maxWidth: "sm", fullWidth: true}, memo(({typePimClassIri, onSelected, close}) => {
    const {t} = useTranslation("psm");

    const {resource: pimResource} = useResource<PimClass>(typePimClassIri);
    const cimIri = pimResource?.pimInterpretation;

    const {sourceSemanticModel} = React.useContext(ConfigurationContext);
    const [fullInheritance] = useAsyncMemo(async () => cimIri ? await sourceSemanticModel.getFullHierarchy(cimIri) : null, [cimIri]);

    const PimClassDetail = useDialog(PimClassDetailDialog);

    const select = useCallback(async (iri: string) => {
        if (fullInheritance) {
            onSelected(iri, fullInheritance);
        }
    }, [onSelected, fullInheritance]);

    const [descendantsOrSelf] = useAsyncMemo(async () => {
        if (!fullInheritance || !cimIri) {
            return [];
        }

        const middleClassIri = cimIri;

        const descendants: SemanticModelClass[] = [];

        const resources = fullInheritance.filter(isSemanticModelClass);
        for (const resource of resources) {
            if (await isAncestorOf(fullInheritance, middleClassIri, resource.id)
            || middleClassIri === resource.id) {
                descendants.push(resource);
            }
        }

        return descendants;
    }, [fullInheritance], []) as [SemanticModelClass[], boolean];

    return <>
            <DialogTitle>
                {t("add to or dialog.title")}
            </DialogTitle>
            <DialogContent>
                <Box style={{maxHeight: 400, overflow: 'auto'}}>
                    {descendantsOrSelf.map(resource => <Item
                        semanticModelClass={resource}
                        onClick={() => select(resource.id)}
                        onInfo={() => PimClassDetail.open({iri: resource.id})}
                    />)}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={close}>{t("cancel")}</Button>
            </DialogActions>
            <PimClassDetail.Component />
    </>
}));
