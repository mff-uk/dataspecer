import React, {memo} from "react";
import {LanguageString} from "model-driven-data/core";
import {useDataPsmAndInterpretedPim} from "../../../hooks/useDataPsmAndInterpretedPim";
import {DataPsmAttribute} from "model-driven-data/data-psm/model";
import {PimAttribute} from "model-driven-data/pim/model";
import {Grid} from "@mui/material";
import {InDifferentLanguages} from "./InDifferentLanguages";
import {RightPanel} from "./right-panel";

export const BasicInfo: React.FC<{ iri: string, label: LanguageString, description: LanguageString, close: () => void }>
    = memo(({iri, label, description, close}) => {

    const {
        pimResource: pimAttribute,
        dataPsmResource: dataPsmAttribute
    } = useDataPsmAndInterpretedPim<DataPsmAttribute, PimAttribute>(iri);

    return (
        <Grid container spacing={5} sx={{pt: 3}}>
            <Grid item xs={6}>
                {pimAttribute?.iri && <InDifferentLanguages label={label} description={description} resourceType="pim"
                                       iri={pimAttribute.iri}/>}
            </Grid>
            <Grid item xs={6}>
                {dataPsmAttribute && <RightPanel iri={iri} close={close}/>}
            </Grid>
        </Grid>
    );
});
