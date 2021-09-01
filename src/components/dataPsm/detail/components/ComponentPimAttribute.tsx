import React from "react";
import {Button, Card, CardContent, Grid, LinearProgress, Typography} from "@material-ui/core";
import {useDetailStyles} from "../dataPsmDetailCommon";
import {LabelDescriptionTable} from "../helper-components/LabelDescriptionTable";
import {useTranslation} from "react-i18next";
import {PimAttribute} from "model-driven-data/pim/model";
import {usePimUpdateLabelAndDescription} from "../../../../hooks/usePimUpdateLabelAndDescription";

export const ComponentPimAttribute: React.FC<{pimAttribute: PimAttribute, isLoading: boolean}> = ({pimAttribute, isLoading}) => {
  const styles = useDetailStyles();
  const {t} = useTranslation("pimAttribute-dialog");
  const updateLabel = usePimUpdateLabelAndDescription(pimAttribute);

  return <Card>
    {isLoading && <LinearProgress />}
    <CardContent>
      <Grid container spacing={5}>
        {/* Label and description */}
        <Grid item xs={12}>
          <Typography variant="h6" component="h3">Label and description</Typography>
          <Button variant="contained" size={"small"} disabled={isLoading} onClick={updateLabel.open}>Modify label and description</Button>
          <updateLabel.component />
          <LabelDescriptionTable label={pimAttribute.pimHumanLabel} description={pimAttribute.pimHumanDescription} />
        </Grid>

        {/* IRI */}
        <Grid item xs={12}>
          <Typography variant="h6" component="h3">IRI</Typography>
          <Typography className={styles.internalIri}>{pimAttribute?.iri}</Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>;
}
