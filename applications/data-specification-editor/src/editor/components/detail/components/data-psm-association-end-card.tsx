import { SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { DataPsmAssociationEnd } from "@dataspecer/core/data-psm/model";
import { Grid } from "@mui/material";
import React, { memo } from "react";
import { useDataPsmAndInterpretedPim } from "../../../hooks/use-data-psm-and-interpreted-pim";
import { useLabelAndDescription } from "../../../hooks/use-label-and-description";
import { InDifferentLanguages } from "./InDifferentLanguages";
import { RightPanel } from "./right-panel";

export const DataPsmAssociationEndCard: React.FC<{ iri: string, onClose: () => void }> = memo(({iri, onClose}) => {
    const associationEnd = useDataPsmAndInterpretedPim<DataPsmAssociationEnd, SemanticModelRelationship>(iri);

    const [associationEndLabel, associationEndDescription] = useLabelAndDescription(associationEnd.dataPsmResource, associationEnd.pimResource);

    return <Grid container spacing={5} sx={{pt: 3}}>
        <Grid item xs={6}>
            <InDifferentLanguages label={associationEndLabel} description={associationEndDescription} resourceType="dataPsm" iri={false ? undefined : iri}/>
        </Grid>
        <Grid item xs={6}>
            <RightPanel iri={iri} close={onClose}/>
        </Grid>
    </Grid>
});
