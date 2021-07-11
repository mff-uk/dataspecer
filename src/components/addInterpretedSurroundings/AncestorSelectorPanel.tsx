import React, {useEffect, useMemo, useState} from "react";
import {List, ListItem, ListItemText, Tooltip, Typography} from "@material-ui/core";
import {LoadingDialog} from "../helper/LoadingDialog";
import {IdProvider, PimClass, Slovnik, SlovnikPimMetadata, Store} from "model-driven-data";
import {GlossaryNote} from "../slovnik.gov.cz/GlossaryNote";
import {useTranslation} from "react-i18next";
import {LanguageStringText} from "../helper/LanguageStringComponents";

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

    let cls: PimClass | undefined;
    while (cls = notVisited[0]) {
        visit(cls);
    }

    return result.reverse();
};

export const AncestorSelectorPanel: React.FC<AncestorSelectorPanelParameters> = ({forCimId, selectedAncestorCimId, selectAncestorCim}) => {
    const [loading, setLoading] = useState(true);
    const [ancestors, setAncestors] = useState<Store>({});

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
                            <ListItemText primary={<LanguageStringText from={ancestor.pimHumanLabel} />} secondary={<GlossaryNote entity={ancestor as SlovnikPimMetadata}/>}/>
                        </ListItem>
                    </Tooltip>
                )}
            </List>
        }
    </>;
};
