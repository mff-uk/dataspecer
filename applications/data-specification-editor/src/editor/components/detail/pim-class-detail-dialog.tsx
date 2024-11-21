import React, {memo} from "react";
import {Box, DialogContentText, Grid, Tab, Tabs} from "@mui/material";
import {LanguageStringFallback} from "../helper/LanguageStringComponents";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {selectLanguage} from "../../utils/select-language";
import {useTranslation} from "react-i18next";
import {InDifferentLanguages} from "./components/InDifferentLanguages";
import {CimLinks} from "./components/cim-links";
import {ResourceInStore} from "./components/resource-in-store";
import {dialog, DialogParameters} from "../../dialog";
import {DialogWrapper} from "./common";
import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";

export const PimClassDetailDialog: React.FC<{iri: string} & DialogParameters> = dialog({maxWidth: "lg", fullWidth: true}, memo(({iri, close}) => {
    const {resource} = useResource<SemanticModelClass>(iri);
    const {t, i18n} = useTranslation("detail");

    const [tab, setTab] = React.useState(0);

    return <DialogWrapper close={close} title={<>
        <div>
            <strong>{t("title class")}: </strong>
            {selectLanguage(resource?.name ?? {}, i18n.languages) ?? <i>{t("no label")}</i>}
            {resource?.iri && <CimLinks iri={resource.iri}/>}
        </div>

        <DialogContentText>
            <LanguageStringFallback from={resource?.description ?? {}} fallback={<i>{t("no description")}</i>}/>
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
                    label={resource?.name ?? {}}
                    description={resource?.description ?? {}}
                />
            </Grid>
            <Grid item xs={6}>

            </Grid>
        </Grid>
        }
        {tab === 1 && <>
            <Box sx={{pt: 3}}>
                <ResourceInStore iri={iri} />
            </Box>
        </>}
    </DialogWrapper>;
}));
