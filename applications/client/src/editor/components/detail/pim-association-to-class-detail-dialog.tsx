import React, {memo} from "react";
import {DialogContentText, Grid, Tab, Tabs} from "@mui/material";
import {LanguageStringFallback} from "../helper/LanguageStringComponents";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {selectLanguage} from "../../utils/select-language";
import {useTranslation} from "react-i18next";
import {InDifferentLanguages} from "./components/InDifferentLanguages";
import {CimLinks} from "./components/cim-links";
import {dialog, DialogParameters} from "../../dialog";
import {DialogWrapper} from "./common";
import {ResourceInStore} from "./components/resource-in-store";
import { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";

export const PimAssociationToClassDetailDialog: React.FC<{parentIri: string, iri: string, orientation: boolean} & DialogParameters> = dialog({maxWidth: "lg", fullWidth: true}, memo(({iri, orientation, close}) => {
    const {resource: association} = useResource<SemanticModelRelationship>(iri);
    const {t, i18n} = useTranslation("detail");

    let associationEnd = association?.ends[orientation ? 1 : 0] ?? null;
    let childIri: string | null = associationEnd?.concept ?? null;
    const {resource: child} = useResource<SemanticModelClass>(childIri);

    const [tab, setTab] = React.useState(0);
    const [storeTab, setStoreTab] = React.useState("pimAssociation");


    return <DialogWrapper close={close} title={<>
        <div>
            <strong>{t("title association")}: </strong>
            {selectLanguage(association?.name ?? {}, i18n.languages) ?? <i>{t("no label")}</i>}
            {association?.iri && <CimLinks iri={association.iri}/>}
        </div>

        <DialogContentText>
            <LanguageStringFallback from={association?.description ?? {}} fallback={<i>{t("no description")}</i>}/>
        </DialogContentText>

        <div>
            <strong>{t("title to class")}: </strong>
            {selectLanguage(child?.name ?? {}, i18n.languages) ?? <i>{t("no label")}</i>}
            {child?.iri && <CimLinks iri={child.iri}/>}
        </div>

        <DialogContentText>
            <LanguageStringFallback from={child?.description ?? {}} fallback={<i>{t("no description")}</i>}/>
        </DialogContentText>
    </>}>
        <Tabs centered value={tab} onChange={(_, ch) => setTab(ch)}>
            <Tab label={t('tab basic info')} />
            <Tab label={t('tab store')} />
        </Tabs>

        {tab === 0 &&
            <Grid container spacing={5} sx={{pt: 3}}>
                <Grid item xs={6}>
                    <InDifferentLanguages
                        label={association?.name ?? {}}
                        description={association?.description ?? {}}
                    />
                </Grid>
                <Grid item xs={6}>
                    {childIri && <InDifferentLanguages
                        label={child?.name ?? {}}
                        description={child?.description ?? {}}
                    />}
                </Grid>
            </Grid>
        }
        {tab === 1 && <>
            <Tabs value={storeTab} onChange={(_, ch) => setStoreTab(ch)} sx={{ mb: 3 }}>
                <Tab label={t('tab pim association')} value={"pimAssociation"} />
                <Tab label={t('tab pim association end')} value={"pimAssociationEnd"} />
                <Tab label={t('tab pim child')} value={"pimChild"} />
            </Tabs>

            {storeTab === "pimAssociation" && <ResourceInStore iri={iri} />}
            {storeTab === "pimAssociationEnd" && associationEnd && <ResourceInStore iri={associationEnd} />}
            {storeTab === "pimChild" && childIri && <ResourceInStore iri={childIri} />}
        </>}
    </DialogWrapper>;
}));
