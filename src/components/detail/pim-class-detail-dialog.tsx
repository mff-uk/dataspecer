import React, {memo} from "react";
import {Box, DialogContent, DialogContentText, Grid, Tab, Tabs} from "@mui/material";
import {LanguageStringFallback} from "../helper/LanguageStringComponents";
import {useResource} from "../../hooks/useResource";
import {PimClass} from "model-driven-data/pim/model";
import {selectLanguage} from "../../utils/selectLanguage";
import {useTranslation} from "react-i18next";
import {InDifferentLanguages} from "./components/InDifferentLanguages";
import {CimLinks} from "./components/cim-links";
import {CloseDialogButton} from "./components/close-dialog-button";
import {ResourceInStore} from "./components/resource-in-store";
import {dialog, DialogParameters} from "../../dialog";
import {DialogTitle} from "./common";

export const PimClassDetailDialog: React.FC<{iri: string} & DialogParameters> = dialog({maxWidth: "lg", fullWidth: true}, memo(({iri, isOpen, close}) => {
    const {resource} = useResource<PimClass>(iri);
    const {t, i18n} = useTranslation("detail");

    const [tab, setTab] = React.useState(0);

    return <>
        <DialogTitle>
            <div>
                <strong>{t("title class")}: </strong>
                {selectLanguage(resource?.pimHumanLabel ?? {}, i18n.languages) ?? <i>{t("no label")}</i>}
                {resource?.pimInterpretation && <CimLinks iri={resource.pimInterpretation}/>}
            </div>

            <DialogContentText>
                <LanguageStringFallback from={resource?.pimHumanDescription ?? {}} fallback={<i>{t("no description")}</i>}/>
            </DialogContentText>

            <CloseDialogButton onClick={close} />
        </DialogTitle>
        <DialogContent>
            <Tabs centered value={tab} onChange={(e, ch) => setTab(ch)}>
                <Tab label={t('tab basic info')} />
                <Tab label={t('tab store')} />
            </Tabs>

            {tab === 0 &&
            <Grid container spacing={5} sx={{pt: 3}}>
                <Grid item xs={6}>
                    <InDifferentLanguages
                        label={resource?.pimHumanLabel ?? {}}
                        description={resource?.pimHumanDescription ?? {}}
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
        </DialogContent>
    </>;
}));
