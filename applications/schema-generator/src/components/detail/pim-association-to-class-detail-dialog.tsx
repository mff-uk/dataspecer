import React, {memo} from "react";
import {DialogContentText, Grid, Tab, Tabs} from "@mui/material";
import {LanguageStringFallback} from "../helper/LanguageStringComponents";
import {useResource} from "../../hooks/useResource";
import {PimAssociation, PimAssociationEnd, PimClass} from "@model-driven-data/core/pim/model";
import {selectLanguage} from "../../utils/selectLanguage";
import {useTranslation} from "react-i18next";
import {InDifferentLanguages} from "./components/InDifferentLanguages";
import {CimLinks} from "./components/cim-links";
import {dialog, DialogParameters} from "../../dialog";
import {DialogWrapper} from "./common";
import {ResourceInStore} from "./components/resource-in-store";

export const PimAssociationToClassDetailDialog: React.FC<{parentIri: string, iri: string, orientation: boolean} & DialogParameters> = dialog({maxWidth: "lg", fullWidth: true}, memo(({iri, orientation, close}) => {
    const {resource: association} = useResource<PimAssociation>(iri);
    const {t, i18n} = useTranslation("detail");

    let associationEndIri: string | null = association?.pimEnd[orientation ? 1 : 0] ?? null;
    const {resource: associationEnd} = useResource<PimAssociationEnd>(associationEndIri);
    let childIri: string | null = associationEnd?.pimPart ?? null;
    const {resource: child} = useResource<PimClass>(childIri);

    const [tab, setTab] = React.useState(0);
    const [storeTab, setStoreTab] = React.useState("pimAssociation");


    return <DialogWrapper close={close} title={<>
        <div>
            <strong>{t("title association")}: </strong>
            {selectLanguage(association?.pimHumanLabel ?? {}, i18n.languages) ?? <i>{t("no label")}</i>}
            {association?.pimInterpretation && <CimLinks iri={association.pimInterpretation}/>}
        </div>

        <DialogContentText>
            <LanguageStringFallback from={association?.pimHumanDescription ?? {}} fallback={<i>{t("no description")}</i>}/>
        </DialogContentText>

        <div>
            <strong>{t("title to class")}: </strong>
            {selectLanguage(child?.pimHumanLabel ?? {}, i18n.languages) ?? <i>{t("no label")}</i>}
            {child?.pimInterpretation && <CimLinks iri={child.pimInterpretation}/>}
        </div>

        <DialogContentText>
            <LanguageStringFallback from={child?.pimHumanDescription ?? {}} fallback={<i>{t("no description")}</i>}/>
        </DialogContentText>
    </>}>
        <Tabs centered value={tab} onChange={(e, ch) => setTab(ch)}>
            <Tab label={t('tab basic info')} />
            <Tab label={t('tab store')} />
        </Tabs>

        {tab === 0 &&
            <Grid container spacing={5} sx={{pt: 3}}>
                <Grid item xs={6}>
                    <InDifferentLanguages
                        label={association?.pimHumanLabel ?? {}}
                        description={association?.pimHumanDescription ?? {}}
                    />
                </Grid>
                <Grid item xs={6}>
                    {childIri && <InDifferentLanguages
                        label={child?.pimHumanLabel ?? {}}
                        description={child?.pimHumanDescription ?? {}}
                    />}
                </Grid>
            </Grid>
        }
        {tab === 1 && <>
            <Tabs value={storeTab} onChange={(e, ch) => setStoreTab(ch)} sx={{ mb: 3 }}>
                <Tab label={t('tab pim association')} value={"pimAssociation"} />
                <Tab label={t('tab pim association end')} value={"pimAssociationEnd"} />
                <Tab label={t('tab pim child')} value={"pimChild"} />
            </Tabs>

            {storeTab === "pimAssociation" && <ResourceInStore iri={iri} />}
            {storeTab === "pimAssociationEnd" && associationEndIri && <ResourceInStore iri={associationEndIri} />}
            {storeTab === "pimChild" && childIri && <ResourceInStore iri={childIri} />}
        </>}
    </DialogWrapper>;
}));
