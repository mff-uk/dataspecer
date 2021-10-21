import React from "react";
import {DataPsmAttribute, DataPsmResource} from "model-driven-data/data-psm/model";
import {Button, Card, CardContent, Grid, LinearProgress, Typography} from "@mui/material";
import {useDetailStyles} from "../dataPsmDetailCommon";
import {LabelDescriptionTable} from "../helper-components/LabelDescriptionTable";
import {useTranslation} from "react-i18next";
import {useDataPsmUpdateLabelAndDescription} from "../../../../hooks/useDataPsmUpdateLabelAndDescription";
import {UpdateTechnicalLabel} from "../helper-components/UpdateTechnicalLabel";
import {UpdateDataType} from "../helper-components/UpdateDataType";
import {IRI} from "../../../helper/IRI";

interface ComponentDataPsmResourceProperties {
  dataPsmResource: DataPsmResource;
  isLoading: boolean;

  showLabelAndDescription?: boolean;
  showTechnicalLabel?: boolean;
  showDatatype?: boolean;
  showIri?: boolean;
}


export const ComponentDataPsmResource: React.FC<ComponentDataPsmResourceProperties> = ({dataPsmResource, isLoading, ...other}) => {
  const styles = useDetailStyles();
  const {t} = useTranslation("psmAttribute-dialog");

  const updateLabel = useDataPsmUpdateLabelAndDescription(dataPsmResource);

  return <Card className={styles.card}>
    {isLoading && <LinearProgress />}
    <CardContent>
      <Grid container spacing={5}>
        {/* Label and description */}
        {other.showLabelAndDescription &&
          <Grid item xs={12}>
            <Typography variant="h6" component="h3">Label and description</Typography>
            <Button variant="contained" size={"small"} disabled={isLoading} onClick={updateLabel.open}>Modify label and description</Button>
            <updateLabel.component />
            <LabelDescriptionTable label={dataPsmResource.dataPsmHumanLabel} description={dataPsmResource.dataPsmHumanDescription} />
          </Grid>
        }

        {/* Technical label */}
        {other.showTechnicalLabel &&
          <Grid item xs={12}>
            <UpdateTechnicalLabel dataPsmResource={dataPsmResource} isLoading={isLoading} />
          </Grid>
        }

        {/* Datatype */}
        {other.showDatatype &&
          <Grid item xs={12}>
            <UpdateDataType dataPsmAttribute={dataPsmResource as DataPsmAttribute} isLoading={isLoading} />
          </Grid>
        }

        {/* IRI */}
        {other.showIri &&
          <Grid item xs={12}>
              <Typography variant="h6" component="h3">IRI</Typography>
              <IRI href={dataPsmResource?.iri as string} singleLine />
          </Grid>
        }
        </Grid>
    </CardContent>
  </Card>;
}
