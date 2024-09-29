import AutorenewIcon from '@mui/icons-material/Autorenew';
import {useAsyncMemo} from "../../../hooks/use-async-memo";
import {useDataPsmAndInterpretedPim} from "../../../hooks/use-data-psm-and-interpreted-pim";
import {DataPsmAssociationEnd, DataPsmClass, DataPsmExternalRoot, DataPsmOr, DataPsmSchema} from "@dataspecer/core/data-psm/model";
import {PimAssociationEnd, PimClass} from "@dataspecer/core/pim/model";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import React, {useCallback} from "react";
import {SCHEMA} from "@dataspecer/core/data-psm/data-psm-vocabulary";
import {ReplaceAssociationWithReferenceDialog} from "./replace-association-with-reference-dialog";
import {ReplaceDataPsmAssociationEndWithReference} from "../../../operations/replace-data-psm-association-end-with-reference";
import {useTranslation} from "react-i18next";
import {MenuItem} from "@mui/material";
import {UseDialogOpenFunction} from "../../../dialog";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import { FederatedObservableStore } from '@dataspecer/federated-observable-store/federated-observable-store';

async function getPimClassInterpretationHierarchy(pimClassIri: string, store: FederatedObservableStore): Promise<string[]> {
    const cls = await store.readResource(pimClassIri) as PimClass;
    if (cls === null) return [];
    const interpretation = [];

    if (cls.pimInterpretation) {
        interpretation.push(cls.pimInterpretation);
    }

    for (const ext of cls.pimExtends) {
        interpretation.push(...await getPimClassInterpretationHierarchy(ext, store));
    }

    return interpretation;
}

export const ReplaceAssociationEndWithReference: React.FC<{dataPsmAssociationEnd: string, open: UseDialogOpenFunction<typeof ReplaceAssociationWithReferenceDialog>}> = ({dataPsmAssociationEnd, open}) => {
    const store = useFederatedObservableStore();
    const {t} = useTranslation("psm");

    const {pimResource} = useDataPsmAndInterpretedPim<DataPsmAssociationEnd, PimAssociationEnd>(dataPsmAssociationEnd);
    const {resource: pimClass} = useResource<PimClass>(pimResource?.pimPart ?? null);

    // This method isn't ideal, does not refresh when
    const [availableReferences] = useAsyncMemo(async () => {
        const foundExistingDataPsms: string[] = [];

        if (pimClass?.pimInterpretation) {
            // List all PSM schemas from linked stores
            const schemas = await store.listResourcesOfType(SCHEMA);

            for (const schemaIri of schemas) {
                const schema = await store.readResource(schemaIri) as DataPsmSchema;
                if (schema === null) continue;
                for (const rootIri of schema.dataPsmRoots) {
                    const root = await store.readResource(rootIri);

                    if (DataPsmClass.is(root)) {
                        if (root.dataPsmInterpretation === null) continue;
                        const interpretations = await getPimClassInterpretationHierarchy(root.dataPsmInterpretation, store);
                        if (interpretations.includes(pimClass.pimInterpretation)) {
                            foundExistingDataPsms.push(schemaIri);
                        }
                    } else if (DataPsmExternalRoot.is(root)) {
                        if (root.dataPsmTypes.length === 0) continue;
                        const pim = await store.readResource(root.dataPsmTypes[0]) as PimClass;
                        if (pim === null) continue;
                        if (pim.pimInterpretation === pimClass.pimInterpretation) {
                            foundExistingDataPsms.push(schemaIri);
                        }
                    } else if (DataPsmOr.is(root)) {
                        const choices = root.dataPsmChoices;
                        // todo: Make better implementation
                        // At least one class should match

                        let found = false;
                        for (const choice of choices) {
                            const dataPsmClass = await store.readResource(choice) as DataPsmClass;
                            if (!dataPsmClass || dataPsmClass.dataPsmInterpretation === null) continue;
                            const interpretations = await getPimClassInterpretationHierarchy(dataPsmClass.dataPsmInterpretation, store);
                            if (interpretations.includes(pimClass.pimInterpretation)) {
                                found = true;
                                break;
                            }
                        }

                        if (found) {
                            foundExistingDataPsms.push(schemaIri);
                        }
                    }
                }
            }
        }

        return foundExistingDataPsms;
    }, [pimClass]);

    const selected = useCallback((dataPsmSchemaIri: string) => {
        const op = new ReplaceDataPsmAssociationEndWithReference(dataPsmAssociationEnd, dataPsmSchemaIri);
        store.executeComplexOperation(op).then();
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
