import React from "react";
import {DataPsmAttribute} from "model-driven-data/data-psm/model";
import {Button, Card, CardContent, Grid, LinearProgress, Typography} from "@material-ui/core";
import {useDetailStyles} from "../dataPsmDetailCommon";
import {LabelDescriptionTable} from "../helper-components/LabelDescriptionTable";
import {useTranslation} from "react-i18next";
import {useDataPsmUpdateLabelAndDescription} from "../../../../hooks/useDataPsmUpdateLabelAndDescription";
import {UpdateTechnicalLabel} from "../helper-components/UpdateTechnicalLabel";
import {UpdateDataType} from "../helper-components/UpdateDataType";

export const ComponentDataPsmAttribute: React.FC<{dataPsmAttribute: DataPsmAttribute, isLoading: boolean}> = ({dataPsmAttribute, isLoading}) => {
  const styles = useDetailStyles();
  const {t} = useTranslation("psmAttribute-dialog");

  const updateLabel = useDataPsmUpdateLabelAndDescription(dataPsmAttribute);

  return <Card>
    {isLoading && <LinearProgress />}
    <CardContent>
      <Grid container spacing={5}>
        {/* Label and description */}
        <Grid item xs={12}>
          <Typography variant="h6" component="h3">Label and description</Typography>
          <Button variant="contained" size={"small"} disabled={isLoading} onClick={updateLabel.open}>Modify label and description</Button>
          <updateLabel.component />
          <LabelDescriptionTable label={dataPsmAttribute.dataPsmHumanLabel} description={dataPsmAttribute.dataPsmHumanDescription} />
        </Grid>


        {/* Technical label */}
        <Grid item xs={12}>
          <UpdateTechnicalLabel dataPsmResource={dataPsmAttribute} isLoading={isLoading} />
        </Grid>

        {/* Datatype */}
        <Grid item xs={12}>
          <UpdateDataType dataPsmAttribute={dataPsmAttribute} isLoading={isLoading} />
        </Grid>

        {/* IRI */}
        <Grid item xs={12}>
          <Typography variant="h6" component="h3">IRI</Typography>
          <Typography className={styles.internalIri}>{dataPsmAttribute?.iri}</Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>;
}
