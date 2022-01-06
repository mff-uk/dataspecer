import AutorenewIcon from '@mui/icons-material/Autorenew';
import {useAsyncMemo} from "../../../hooks/useAsyncMemo";
import {useDataPsmAndInterpretedPim} from "../../../hooks/useDataPsmAndInterpretedPim";
import {DataPsmAssociationEnd, DataPsmClass, DataPsmSchema} from "model-driven-data/data-psm/model";
import {PimAssociationEnd, PimClass} from "model-driven-data/pim/model";
import {useResource} from "../../../hooks/useResource";
import React, {useCallback} from "react";
import {StoreContext} from "../../App";
import {SCHEMA} from "model-driven-data/data-psm/data-psm-vocabulary";
import {StoreByPropertyDescriptor} from "../../../store/operation-executor";
import {ReplaceAssociationWithReferenceDialog} from "./replace-association-with-reference-dialog";
import {ReplaceDataPsmAssociationEndWithReference} from "../../../operations/replace-data-psm-association-end-with-reference";
import {useTranslation} from "react-i18next";
import {MenuItem} from "@mui/material";
import {UseDialogOpenFunction} from "../../../dialog";

const LINKED_STORE_DESCRIPTOR = new StoreByPropertyDescriptor(["reused"]);

export const ReplaceAssociationEndWithReference: React.FC<{dataPsmAssociationEnd: string, open: UseDialogOpenFunction<typeof ReplaceAssociationWithReferenceDialog>}> = ({dataPsmAssociationEnd, open}) => {
    const {store} = React.useContext(StoreContext);
    const {t} = useTranslation("psm");

    const {pimResource} = useDataPsmAndInterpretedPim<DataPsmAssociationEnd, PimAssociationEnd>(dataPsmAssociationEnd);
    const {resource: pimClass} = useResource<PimClass>(pimResource?.pimPart ?? null);

    // This method isn't ideal, does not refresh when
    const [availableReferences] = useAsyncMemo(async () => {
        const foundExistingDataPsms: string[] = [];

        if (pimClass?.pimInterpretation) {
            // List all PSM schemas from linked stores
            const schemas = await store.listResourcesOfType(SCHEMA, LINKED_STORE_DESCRIPTOR);

            for (const schemaIri of schemas) {
                const schema = await store.readResource(schemaIri) as DataPsmSchema;
                if (schema === null) continue;
                for (const rootIri of schema.dataPsmRoots) {
                    const root = await store.readResource(rootIri) as DataPsmClass;
                    if (root === null || root.dataPsmInterpretation === null) continue;
                    const pim = await store.readResource(root.dataPsmInterpretation) as PimClass;
                    if (pim === null) continue;
                    if (pim.pimInterpretation === pimClass.pimInterpretation) {
                        foundExistingDataPsms.push(schemaIri);
                    }
                }
            }
        }

        return foundExistingDataPsms;
    }, [pimClass]);

    const selected = useCallback((dataPsmSchemaIri: string) => {
        const op = new ReplaceDataPsmAssociationEndWithReference(dataPsmAssociationEnd, dataPsmSchemaIri);
        store.executeOperation(op).then();
    }, [dataPsmAssociationEnd, store]);

    return <>
        {availableReferences && availableReferences.length > 0 &&
            <MenuItem
                onClick={() => open({roots: availableReferences as string[], onSelect: selected})}
                title={t("replace with reference")}
            ><AutorenewIcon /></MenuItem>
        }
    </>
}
