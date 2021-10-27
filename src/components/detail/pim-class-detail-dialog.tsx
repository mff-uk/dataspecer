import React, {memo} from "react";
import {DialogParameters} from "../dialog-parameters";
import {Dialog, DialogContent, DialogContentText, DialogTitle, Grid} from "@mui/material";
import {LanguageStringFallback} from "../helper/LanguageStringComponents";
import {useResource} from "../../hooks/useResource";
import {PimClass} from "model-driven-data/pim/model";
import {selectLanguage} from "../../utils/selectLanguage";
import {useTranslation} from "react-i18next";
import {InDifferentLanguages} from "./components/InDifferentLanguages";
import {CimLinks} from "./components/cim-links";
import {CloseDialogButton} from "./components/close-dialog-button";

export const PimClassDetailDialog: React.FC<{iri: string} & DialogParameters> = memo(({iri, isOpen, close}) => {
    const {resource} = useResource<PimClass>(iri);
    const {t, i18n} = useTranslation("detail");

    return <Dialog open={isOpen} onClose={close} maxWidth="md" fullWidth>
        <DialogTitle>
            {selectLanguage(resource?.pimHumanLabel ?? {}, i18n.languages) ?? <i>Unnamed resource</i>}
            {resource?.pimInterpretation && <CimLinks iri={resource.pimInterpretation}/>}

            <CloseDialogButton onClick={close} />
        </DialogTitle>
        <DialogContent>
            <DialogContentText>
                <LanguageStringFallback from={resource?.pimHumanDescription ?? {}} fallback={<i>no description for class</i>}/>
            </DialogContentText>
            <Grid container spacing={5} sx={{pt: 3}}>
                <Grid item xs={6}>
                    <InDifferentLanguages
                        label={resource?.pimHumanLabel ?? {}}
                        description={resource?.pimHumanDescription ?? {}}
                        resourceType="pim"
                        iri={iri}
                        disableEditing
                    />
                </Grid>
                <Grid item xs={6}>

                </Grid>
            </Grid>
        </DialogContent>
    </Dialog>;
});
