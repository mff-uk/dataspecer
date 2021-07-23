import React, {useEffect, useMemo, useState} from "react";
import {IconButton, List, ListItem, ListItemText, Tooltip, Typography} from "@material-ui/core";
import {LoadingDialog} from "../helper/LoadingDialog";
import {IdProvider, PimClass, Slovnik, SlovnikPimMetadata, Store} from "model-driven-data";
import {GlossaryNote} from "../slovnik.gov.cz/GlossaryNote";
import {useTranslation} from "react-i18next";
import {LanguageStringText} from "../helper/LanguageStringComponents";
import InfoTwoToneIcon from "@material-ui/icons/InfoTwoTone";
import {useDialog} from "../../hooks/useDialog";
import {PimClassDetailDialog} from "../pimDetail/pimClassDetailDialog";

interface AncestorSelectorPanelParameters {
    forCimId: string,
    selectedAncestorCimId: string | null,
    selectAncestorCim: (cimId: string) => void,
}

const topologicalSort = (classes: PimClass[], startFrom: string) => {
    let notVisited = [...classes];

    const result: PimClass[] = [];

    const visit = (cls: PimClass) => {
        if (!notVisited.includes(cls)) return;
        notVisited = notVisited.filter(x => x !== cls);
        cls.pimIsa.map(parent => classes.find(c => c.id === parent)).filter((x): x is PimClass => x !== undefined).map(visit);
        result.push(cls);
    };
    
    const start = classes.find(c => c.id === startFrom);
    if (start) visit(start);

    let cls: PimClass | undefined = notVisited[0];
    while (cls) {
        visit(cls);
        cls = notVisited[0];
    }

    return result.reverse();
};

export const AncestorSelectorPanel: React.FC<AncestorSelectorPanelParameters> = ({forCimId, selectedAncestorCimId, selectAncestorCim}) => {
    const [loading, setLoading] = useState(true);
    const [ancestors, setAncestors] = useState<Store>({});
    const classDialog = useDialog(PimClassDetailDialog, "cls");

    const {t} = useTranslation("interpretedSurrounding");

    useEffect(() => {
        if (forCimId) {
            setLoading(true);
            setAncestors({});

            const slovnik = new Slovnik(new IdProvider());
            slovnik.getHierarchy(forCimId).then(result => {
                setAncestors(result);
                setLoading(false);
            });
        }
    }, [forCimId]);

    const sorted = useMemo(() => topologicalSort(Object.values(ancestors) as PimClass[], forCimId), [ancestors, forCimId]);

    return <>
        <Typography variant={"h6"}>{t("ancestors title")}</Typography>
        {loading ? <LoadingDialog /> :
            <List component="nav" aria-label="main mailbox folders" dense>
                {sorted.map(ancestor =>
                    <Tooltip open={(ancestor.pimHumanDescription && Object.values(ancestor.pimHumanDescription).some(s => s.length > 0)) ? undefined : false} title={<LanguageStringText from={ancestor.pimHumanDescription} />} placement="left" key={ancestor.id}>
                        <ListItem button selected={ancestor.pimInterpretation === (selectedAncestorCimId ?? forCimId)} onClick={() => ancestor.pimInterpretation && selectAncestorCim(ancestor.pimInterpretation)}>
                            <ListItemText
                                primary={<>
                                    <LanguageStringText from={ancestor.pimHumanLabel} />
                                    {" "}
                                    <IconButton size="small" onClick={(event) => {classDialog.open({cls: ancestor}); event.stopPropagation();}}><InfoTwoToneIcon fontSize="inherit" /></IconButton>
                                </>}
                                secondary={<GlossaryNote entity={ancestor as SlovnikPimMetadata}/>}
                            />
                        </ListItem>
                    </Tooltip>
                )}
            </List>
        }
        <classDialog.component store={ancestors} />
    </>;
};
