import React, {memo} from "react";
import {Grid} from "@mui/material";
import {InDifferentLanguages} from "./InDifferentLanguages";
import {RightPanel} from "./right-panel";
import {useDataPsmAndInterpretedPim} from "../../../hooks/use-data-psm-and-interpreted-pim";
import {DataPsmClass} from "@dataspecer/core/data-psm/model";
import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import {useLabelAndDescription} from "../../../hooks/use-label-and-description";
import {ClassExamples} from "./class-examples";
import {InstanceType} from "./instance-type";

export const DataPsmClassCard: React.FC<{ iri: string, onClose: () => void  }> = memo(({iri, onClose}) => {
    const resources = useDataPsmAndInterpretedPim<DataPsmClass, SemanticModelClass | null>(iri);
    const [label, description] = useLabelAndDescription(resources.dataPsmResource, resources.pimResource);

    return <>
        <Grid container spacing={5} sx={{pt: 3}}>
            <Grid item xs={6}>
                <InDifferentLanguages label={label} description={description} iri={false ? undefined : iri} resourceType="dataPsm"/>
            </Grid>
            <Grid item xs={6}>
                <RightPanel iri={iri} close={onClose}/>
                {resources.pimResource && <ClassExamples pimClassIri={resources.pimResource.id} />}
                <InstanceType psmClassIri={iri} />
            </Grid>
        </Grid>
    </>;
});
