import React from "react";
import {List, ListItem, ListItemText, Tooltip, Typography} from "@material-ui/core";
import {LoadingDialog} from "../helper/LoadingDialog";
import {SlovnikGovCzGlossary} from "../slovnik.gov.cz/SlovnikGovCzGlossary";
import {useTranslation} from "react-i18next";
import {LanguageStringText} from "../helper/LanguageStringComponents";
import {PimClass} from "model-driven-data/pim/model";
import {StoreContext} from "../App";
import {CoreResourceReader} from "model-driven-data/core";
import {useAsyncMemo} from "../../hooks/useAsyncMemo";

interface AncestorSelectorPanelParameters {
    forCimClassIri: string,
    selectedAncestorCimIri: string | null,
    selectAncestorCimIri: (ancestorCimIri: string) => void,
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
        console.warn(resource);
        sorted.push(resource);
        queue.push(...(resource.pimExtends ?? []));
    }

    return sorted;
}

export const AncestorSelectorPanel: React.FC<AncestorSelectorPanelParameters> = ({forCimClassIri, selectedAncestorCimIri, selectAncestorCimIri}) => {
    // const classDialog = useDialog(PimClassDetailDialog, "cls");

    const {t} = useTranslation("interpretedSurrounding");
    const {cim} = React.useContext(StoreContext);
    const [sorted, loading] = useAsyncMemo(async () => await BFS(await cim.cimAdapter.getFullHierarchy(forCimClassIri), cim.iriProvider.cimToPim(forCimClassIri)), [cim.cimAdapter, forCimClassIri]);

    return <>
        <Typography variant={"h6"}>{t("ancestors title")}</Typography>
        {loading ? <LoadingDialog /> :
            <List component="nav" aria-label="main mailbox folders" dense>
                {sorted && sorted.map(ancestor =>
                    <Tooltip open={(ancestor.pimHumanDescription && Object.values(ancestor.pimHumanDescription).some(s => s.length > 0)) ? undefined : false} title={<LanguageStringText from={ancestor.pimHumanDescription} />} placement="left" key={ancestor.iri}>
                        <ListItem button selected={ancestor.pimInterpretation === (selectedAncestorCimIri ?? forCimClassIri)} onClick={() => ancestor.pimInterpretation && selectAncestorCimIri(ancestor.pimInterpretation)}>
                            <ListItemText
                                primary={<>
                                    <LanguageStringText from={ancestor.pimHumanLabel} />
                                    {" "}
                                    {/*<IconButton size="small" onClick={(event) => {classDialog.open({cls: ancestor}); event.stopPropagation();}}><InfoTwoToneIcon fontSize="inherit" /></IconButton>*/}
                                </>}
                                secondary={<SlovnikGovCzGlossary cimResourceIri={ancestor.pimInterpretation as string}/>}
                            />
                        </ListItem>
                    </Tooltip>
                )}
            </List>
        }
        {/*<classDialog.component store={ancestors} />*/}
    </>;
};
