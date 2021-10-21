import React from "react";
import {Button, Card, CardContent, Grid, LinearProgress, Typography} from "@mui/material";
import {useDetailStyles} from "../dataPsmDetailCommon";
import {LabelDescriptionTable} from "../helper-components/LabelDescriptionTable";
import {useTranslation} from "react-i18next";
import {PimResource} from "model-driven-data/pim/model";
import {usePimUpdateLabelAndDescription} from "../../../../hooks/usePimUpdateLabelAndDescription";
import {IRI} from "../../../helper/IRI";

interface ComponentPimResourceParameters {
  pimResource: PimResource;
  isLoading: boolean;

  showLabelAndDescription?: boolean;
  showIri?: boolean;
}

export const ComponentPimResource: React.FC<ComponentPimResourceParameters> = ({pimResource, isLoading, ...other}) => {
  const styles = useDetailStyles();
  const {t} = useTranslation("pimAttribute-dialog");
  const updateLabel = usePimUpdateLabelAndDescription(pimResource);

  return <Card  className={styles.card}>
    {isLoading && <LinearProgress />}
    <CardContent>
      <Grid container spacing={5}>
        {/* Label and description */}
        {other.showLabelAndDescription &&
          <Grid item xs={12}>
            <Typography variant="h6" component="h3">Label and description</Typography>
            <Button variant="contained" size={"small"} disabled={isLoading} onClick={updateLabel.open}>Modify label and description</Button>
            <updateLabel.component />
            <LabelDescriptionTable label={pimResource.pimHumanLabel} description={pimResource.pimHumanDescription} />
          </Grid>
        }

        {/* IRI */}
        {other.showIri &&
          <Grid item xs={12}>
              <Typography variant="h6" component="h3">IRI</Typography>
              <IRI href={pimResource?.iri as string} singleLine />
          </Grid>
        }
      </Grid>
    </CardContent>
  </Card>;
}
