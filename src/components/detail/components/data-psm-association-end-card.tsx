import React, {memo, useMemo} from "react";
import {PimAssociationEnd} from "model-driven-data/pim/model";
import {Grid} from "@mui/material";
import {InDifferentLanguages} from "./InDifferentLanguages";
import {RightPanel} from "./right-panel";
import {useDataPsmAndInterpretedPim} from "../../../hooks/useDataPsmAndInterpretedPim";
import {DataPsmAssociationEnd} from "model-driven-data/data-psm/model";
import {usePimAssociationFromPimAssociationEnd} from "../../dataPsm/use-pim-association-from-pim-association-end";
import {useLabelAndDescription} from "../../../hooks/use-label-and-description";

export const DataPsmAssociationEndCard: React.FC<{ iri: string, onClose: () => void }> = memo(({iri, onClose}) => {
    const associationEnd = useDataPsmAndInterpretedPim<DataPsmAssociationEnd, PimAssociationEnd>(iri);
    const association = usePimAssociationFromPimAssociationEnd(associationEnd.dataPsmResource?.dataPsmInterpretation ?? null);

    const [associationEndLabel, associationEndDescription] = useLabelAndDescription(associationEnd.dataPsmResource, associationEnd.pimResource);
    const label = useMemo(() => ({...association.resource?.pimHumanLabel, ...associationEndLabel}), [associationEnd.pimResource?.pimHumanLabel, associationEndLabel]);
    const description = useMemo(() => ({...association.resource?.pimHumanDescription, ...associationEndDescription}), [associationEnd.pimResource?.pimHumanDescription, associationEndDescription]);

    return <Grid container spacing={5} sx={{pt: 3}}>
        <Grid item xs={6}>
            {associationEnd.pimResource?.iri &&
            <InDifferentLanguages label={label} description={description} resourceType="pim"
                                  iri={associationEnd.pimResource.iri}/>}
        </Grid>
        <Grid item xs={6}>
            <RightPanel iri={iri} close={onClose}/>
        </Grid>
    </Grid>
});
