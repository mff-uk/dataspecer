import React, {memo, useMemo} from "react";
import {Box, DialogContentText, Tab, Tabs, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {DataPsmAssociationEnd, DataPsmClass} from "@model-driven-data/core/lib/data-psm/model";
import {PimAssociationEnd, PimClass} from "@model-driven-data/core/lib/pim/model";
import {useDataPsmAndInterpretedPim} from "../../hooks/useDataPsmAndInterpretedPim";
import {selectLanguage} from "../../utils/selectLanguage";
import {usePimAssociationFromPimAssociationEnd} from "../data-psm/use-pim-association-from-pim-association-end";
import {LanguageStringFallback} from "../helper/LanguageStringComponents";
import {DataPsmAssociationEndCard} from "./components/data-psm-association-end-card";
import {DataPsmClassCard} from "./components/data-psm-class-card";
import {ResourceInStore} from "./components/resource-in-store";
import {useLabelAndDescription} from "../../hooks/use-label-and-description";
import {CimLinks} from "./components/cim-links";
import {Show} from "../helper/Show";
import {dialog, DialogParameters} from "../../dialog";
import {DialogWrapper} from "./common";

export const DataPsmAssociationToClassDetailDialog: React.FC<{parentIri: string, iri: string} & DialogParameters> = dialog({maxWidth: "lg", fullWidth: true}, memo(({iri, close}) => {
    const associationEnd = useDataPsmAndInterpretedPim<DataPsmAssociationEnd, PimAssociationEnd>(iri);
    const association = usePimAssociationFromPimAssociationEnd(associationEnd.dataPsmResource?.dataPsmInterpretation ?? null);
    const childClass = useDataPsmAndInterpretedPim<DataPsmClass, PimClass>(associationEnd?.dataPsmResource?.dataPsmPart ?? null);

    const [associationEndLabel, associationEndDescription] = useLabelAndDescription(associationEnd.dataPsmResource, associationEnd.pimResource);
    const wholeAssociationLabel = useMemo(() => ({...association.resource?.pimHumanLabel, ...associationEndLabel}), [association.resource?.pimHumanLabel, associationEndLabel]);
    const wholeAssociationDescription = useMemo(() => ({...association.resource?.pimHumanDescription, ...associationEndDescription}), [association.resource?.pimHumanDescription, associationEndDescription]);
    const [childClassLabel, childClassDescription] = useLabelAndDescription(childClass.dataPsmResource, childClass.pimResource);

    const [tab, setTab] = React.useState(0);
    const [storeTab, setStoreTab] = React.useState("dataPsmAssociationEnd");
    let currentStoreTabIri: string | null = null;
    switch (storeTab) {
        case "dataPsmAssociationEnd": currentStoreTabIri = associationEnd?.dataPsmResource?.iri ?? null; break;
        case "pimAssociationEnd": currentStoreTabIri = associationEnd?.pimResource?.iri ?? null; break;
        case "pimAssociation": currentStoreTabIri = association?.resource?.iri ?? null; break;
        case "dataPsmChild": currentStoreTabIri = childClass?.dataPsmResource?.iri ?? null; break;
        case "pimChild": currentStoreTabIri = childClass?.pimResource?.iri ?? null; break;
    }

    const {t, i18n} = useTranslation("detail");

    return <DialogWrapper close={close} title={<>
        <div>
            <strong>{t("title association")}: </strong>
            {selectLanguage(wholeAssociationLabel, i18n.languages) ?? <i>{t("no label")}</i>}
            {association.resource?.pimInterpretation && <CimLinks iri={association.resource.pimInterpretation}/>}
        </div>

        <DialogContentText>
            <LanguageStringFallback from={wholeAssociationDescription} fallback={<i>{t("no description")}</i>}/>
        </DialogContentText>

        <div>
            <strong>{t("title to class")}: </strong>
            {selectLanguage(childClassLabel, i18n.languages) ?? <i>{t("no label")}</i>}
            {childClass.pimResource?.pimInterpretation && <CimLinks iri={childClass.pimResource.pimInterpretation}/>}
        </div>

        <DialogContentText>
            <LanguageStringFallback from={childClassDescription} fallback={<i>{t("no description")}</i>}/>
        </DialogContentText>
    </>}>
        <Tabs centered value={tab} onChange={(e, ch) => setTab(ch)}>
            <Tab label={t('tab association')} />
            <Tab label={t('tab range class')} />
            <Tab label={t('tab store')} />
        </Tabs>

        <Show when={tab === 0}><DataPsmAssociationEndCard iri={iri} onClose={close} /></Show>
        <Show when={tab === 1}>{associationEnd?.dataPsmResource?.dataPsmPart && <DataPsmClassCard iri={associationEnd?.dataPsmResource?.dataPsmPart as string} onClose={close} />}</Show>
        {tab === 2 && <>
            <Box sx={{my: 3}}>
                <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography variant={"subtitle1"} sx={{fontWeight: "bold", mr: 2}}>
                        {t('tab title association')}
                    </Typography>
                    <Tabs value={storeTab} onChange={(e, ch) => setStoreTab(ch)}>
                        <Tab label={t('tab data psm association end')} value={"dataPsmAssociationEnd"} />
                        <Tab label={t('tab pim association end')} value={"pimAssociationEnd"} />
                        <Tab label={t('tab pim association')} value={"pimAssociation"} />
                    </Tabs>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography variant={"subtitle1"} sx={{fontWeight: "bold", mr: 2}}>
                        {t('tab title range class')}
                    </Typography>
                    <Tabs value={storeTab} onChange={(e, ch) => setStoreTab(ch)}>
                        <Tab label={t('tab data psm child')} value={"dataPsmChild"} />
                        <Tab label={t('tab pim child')} value={"pimChild"} />
                    </Tabs>
                </Box>
            </Box>

            {currentStoreTabIri && <ResourceInStore iri={currentStoreTabIri}/>}
        </>}
    </DialogWrapper>;
}));
