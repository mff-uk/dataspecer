import { isSemanticModelGeneralization, SemanticModelClass, SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import { IconButton, List, ListItem, ListItemText, Tooltip, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAsyncMemo } from "../../../hooks/use-async-memo";
import { useDialog } from "../../../hooks/use-dialog";
import { ConfigurationContext } from "../../App";
import { PimClassDetailDialog } from "../../detail/pim-class-detail-dialog";
import { LanguageStringFallback, LanguageStringText } from "../../helper/LanguageStringComponents";
import { LoadingDialog } from "../../helper/LoadingDialog";
import { SlovnikGovCzGlossary } from "../../slovnik.gov.cz/SlovnikGovCzGlossary";

interface AncestorSelectorPanelParameters {
    forCimClassIri: string,
    selectedAncestorCimIri: string | null,
    selectAncestorCimIri: (ancestorCimIri: string) => void,

    hierarchyStore: SemanticModelEntity[] | null;
    setHierarchyStore: (reader: SemanticModelEntity[]) => void;
}

const BFS = async (modelReader: SemanticModelEntity[], rootIri: string): Promise<SemanticModelClass[]> => {
    const sorted: SemanticModelClass[] = [];
    const queue: string[] = [rootIri];
    const visited = new Set<string>();

    while (queue.length > 0) {
        const processed = queue.shift();
        if (visited.has(processed)) {
            continue;
        }
        visited.add(processed);

        const resource = modelReader.find(e => e.id === processed) as SemanticModelClass;
        if (!resource) {
            // The given resource does not exist. This is not an error. It just means that some CIM adapters are missing.
            continue;
        }
        sorted.push(resource);
        modelReader.filter(isSemanticModelGeneralization).filter(g => g.child === processed).forEach(g => queue.push(g.parent));
    }

    return sorted;
}

export const AncestorSelectorPanel: React.FC<AncestorSelectorPanelParameters> = ({forCimClassIri, selectedAncestorCimIri, selectAncestorCimIri, hierarchyStore, setHierarchyStore}) => {
    const {t} = useTranslation("interpretedSurrounding");
    const {sourceSemanticModel} = React.useContext(ConfigurationContext);
    const [sorted, loading] = useAsyncMemo(async () => hierarchyStore ? await BFS(hierarchyStore, forCimClassIri) : null, [hierarchyStore]);

    useEffect(() => {
        let isActive = true;
        sourceSemanticModel.getFullHierarchy(forCimClassIri).then(s => isActive && setHierarchyStore(s));
        return () => {
            isActive = false;
        };
    }, [sourceSemanticModel, forCimClassIri, setHierarchyStore]);

    const ClassDetailDialog = useDialog(PimClassDetailDialog, ["iri"]);

    return <>
        <Typography variant="subtitle1" component="h2">{t('ancestors title')}</Typography>
        {(loading || hierarchyStore === null) ? <LoadingDialog /> :
            <List component="nav" aria-label="main mailbox folders" dense>
                {sorted && sorted.map(ancestor =>
                    <Tooltip open={(ancestor.description && Object.values(ancestor.description).some(s => s.length > 0)) ? undefined : false} title={<LanguageStringText from={ancestor.description} />} placement="left" key={ancestor.iri}>
                        <ListItem button selected={ancestor.iri === (selectedAncestorCimIri ?? forCimClassIri)} onClick={() => ancestor.id && selectAncestorCimIri(ancestor.id)}>
                            <ListItemText
                                primary={<LanguageStringFallback from={ancestor.name} fallback={<i>unnamed</i>} />}
                                secondary={<SlovnikGovCzGlossary cimResourceIri={ancestor.iri as string}/>}
                            />
                           <IconButton size="small" onClick={(event) => {ClassDetailDialog.open({iri: ancestor.iri as string}); event.stopPropagation();}}><InfoTwoToneIcon fontSize="inherit" /></IconButton>
                        </ListItem>
                    </Tooltip>
                )}
            </List>
        }

        <ClassDetailDialog.Component />
    </>;
};
