import React, {memo} from "react";
import {DialogContent, DialogContentText, DialogTitle, Grid} from "@mui/material";
import {LanguageStringFallback} from "../helper/LanguageStringComponents";
import {useResource} from "../../hooks/useResource";
import {PimAssociation, PimClass} from "model-driven-data/pim/model";
import {selectLanguage} from "../../utils/selectLanguage";
import {useTranslation} from "react-i18next";
import {InDifferentLanguages} from "./components/InDifferentLanguages";
import {CimLinks} from "./components/cim-links";
import {CloseDialogButton} from "./components/close-dialog-button";
import RemoveIcon from "@mui/icons-material/Remove";
import {dialog, DialogParameters} from "../../dialog";

export const PimAssociationToClassDetailDialog: React.FC<{parentIri: string, iri: string, orientation: boolean} & DialogParameters> = dialog({maxWidth: "md", fullWidth: true}, memo(({parentIri, iri, orientation, isOpen, close}) => {
    // const {resource: parent} = useResource<PimClass>(parentIri);
    const {resource: association} = useResource<PimAssociation>(iri);
    const {t, i18n} = useTranslation("detail");

    let childIri: string | null = association?.pimEnd[orientation ? 1 : 0] ?? null;
    const {resource: child} = useResource<PimClass>(childIri);

    return <>
        <DialogTitle>
            {selectLanguage(association?.pimHumanLabel ?? {}, i18n.languages) ?? <i>parent</i>}
            {association?.pimInterpretation && <CimLinks iri={association.pimInterpretation}/>}

            <RemoveIcon sx={{mx: 5, verticalAlign: "middle"}} />

            {selectLanguage(child?.pimHumanLabel ?? {}, i18n.languages) ?? <i>parent</i>}
            {child?.pimInterpretation && <CimLinks iri={child.pimInterpretation}/>}

            <CloseDialogButton onClick={close} />
        </DialogTitle>
        <DialogContent>
            <DialogContentText>
                <LanguageStringFallback from={association?.pimHumanDescription ?? {}} fallback={<i>no description for association</i>}/>
                <RemoveIcon sx={{mx: 1, verticalAlign: "top"}}/>
                <LanguageStringFallback from={child?.pimHumanDescription ?? {}} fallback={<i>no description for range class</i>}/>
            </DialogContentText>
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
        </DialogContent>
    </>;
}));
