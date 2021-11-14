import React, {useContext, useEffect, useMemo, useState} from "react";
import {IconButton, List, ListItem, ListItemText, Tooltip, Typography} from "@mui/material";
import {LoadingDialog} from "../helper/LoadingDialog";
import {SlovnikGovCzGlossary} from "../slovnik.gov.cz/SlovnikGovCzGlossary";
import {useTranslation} from "react-i18next";
import {LanguageStringFallback, LanguageStringText} from "../helper/LanguageStringComponents";
import {PimClass} from "model-driven-data/pim/model";
import {StoreContext} from "../App";
import {CoreResourceReader, ReadOnlyMemoryStore} from "model-driven-data/core";
import {useAsyncMemo} from "../../hooks/useAsyncMemo";
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import {useDialog} from "../../hooks/useDialog";
import {PimClassDetailDialog} from "../detail/pim-class-detail-dialog";
import {FederatedObservableStore} from "../../store/federated-observable-store";
import {StoreMetadataTag} from "../../configuration/configuration";

interface AncestorSelectorPanelParameters {
    forCimClassIri: string,
    selectedAncestorCimIri: string | null,
    selectAncestorCimIri: (ancestorCimIri: string) => void,

    hierarchyStore: CoreResourceReader | null;
    setHierarchyStore: (reader: CoreResourceReader) => void;
}

const BFS = async (modelReader: CoreResourceReader, rootIri: string): Promise<PimClass[]> => {
    const sorted: PimClass[] = [];
    const queue: string[] = [rootIri];
    const visited = new Set<string>();

    let processed: string | undefined;
    while (processed = queue.shift()) {
        if (visited.has(processed)) {
            continue;
        }
        visited.add(processed);

        const resource = await modelReader.readResource(processed) as PimClass;
        sorted.push(resource);
        queue.push(...(resource.pimExtends ?? []));
    }

    return sorted;
}

export const AncestorSelectorPanel: React.FC<AncestorSelectorPanelParameters> = ({forCimClassIri, selectedAncestorCimIri, selectAncestorCimIri, hierarchyStore, setHierarchyStore}) => {
    const {t} = useTranslation("interpretedSurrounding");
    const {cim} = React.useContext(StoreContext);
    const [sorted, loading] = useAsyncMemo(async () => hierarchyStore ? await BFS(hierarchyStore, cim.iriProvider.cimToPim(forCimClassIri)) : null, [hierarchyStore]);

    useEffect(() => {
        let isActive = true;
        cim.cimAdapter.getFullHierarchy(forCimClassIri).then(s => isActive && setHierarchyStore(s));
        return () => {
            isActive = false;
        };
    }, [cim.cimAdapter, forCimClassIri]);

    const ClassDetailDialog = useDialog(PimClassDetailDialog, ["iri"]);

    // Following code creates a new store context containing downloaded data. This allow us to use standard application
    // components which render dialogs and other stuff

    const storeContext = useContext(StoreContext);
    const [store] = useState(() => new FederatedObservableStore());
    const NewStoreContext = useMemo(() => ({...storeContext, store}), [storeContext, store]);
    useEffect(() => {
        if (sorted) {
            const readOnlyMemoryStore = ReadOnlyMemoryStore.create(Object.fromEntries(sorted.map(r => [r.iri, r])));
            const storeWithMetadata = {
                store: readOnlyMemoryStore,
                metadata: {
                    tags: ["cim-as-pim"] as StoreMetadataTag[]
                },
            };

            store.addStore(storeWithMetadata);
            return () => store.removeStore(storeWithMetadata);
        }
    }, [sorted]);

    return <>
        <Typography variant={"h6"}>{t("ancestors title")}</Typography>
        {(loading || hierarchyStore === null) ? <LoadingDialog /> :
            <List component="nav" aria-label="main mailbox folders" dense>
                {sorted && sorted.map(ancestor =>
                    <Tooltip open={(ancestor.pimHumanDescription && Object.values(ancestor.pimHumanDescription).some(s => s.length > 0)) ? undefined : false} title={<LanguageStringText from={ancestor.pimHumanDescription} />} placement="left" key={ancestor.iri}>
                        <ListItem button selected={ancestor.pimInterpretation === (selectedAncestorCimIri ?? forCimClassIri)} onClick={() => ancestor.pimInterpretation && selectAncestorCimIri(ancestor.pimInterpretation)}>
                            <ListItemText
                                primary={<LanguageStringFallback from={ancestor.pimHumanLabel} fallback={<i>unnamed</i>} />}
                                secondary={<SlovnikGovCzGlossary cimResourceIri={ancestor.pimInterpretation as string}/>}
                            />
                           <IconButton size="small" onClick={(event) => {ClassDetailDialog.open({iri: ancestor.iri as string}); event.stopPropagation();}}><InfoTwoToneIcon fontSize="inherit" /></IconButton>
                        </ListItem>
                    </Tooltip>
                )}
            </List>
        }

        <StoreContext.Provider value={NewStoreContext}>
            <ClassDetailDialog.component />
        </StoreContext.Provider>
    </>;
};
