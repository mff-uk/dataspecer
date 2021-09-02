import React, {useEffect, useState} from "react";
import {DataPsmAttribute} from "model-driven-data/data-psm/model";
import {Button, Grid, TextField, Typography} from "@material-ui/core";
import {StoreContext} from "../../../App";

export const UpdateDataType: React.FC<{dataPsmAttribute: DataPsmAttribute, isLoading: boolean}> = ({dataPsmAttribute, isLoading}) => {
  const {updateResourceTechnicalLabel} = React.useContext(StoreContext);
  const [value, setValue] = useState<string>("");
  useEffect(() => setValue(dataPsmAttribute.dataPsmDatatype ?? ""), [dataPsmAttribute.dataPsmDatatype]);

/*  const update = useCallback(() => updateResourceTechnicalLabel({
    forDataPsmAttributeIri: dataPsmResource.iri as string,
    label: technicalLabel,
  }), [updateResourceTechnicalLabel, technicalLabel]);*/

  return <>
    <Typography variant="h6" component="h3">Technical label</Typography>
  <Grid container spacing={2} alignItems="center">
    <Grid item xs={8}>
      <TextField
          value={value}
          onChange={event => setValue(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter") {
              event.preventDefault();
              //update();
            }
          }}
          fullWidth
          disabled={isLoading}
      />
    </Grid>
    <Grid item xs={4}>
      <Button color={(value == (dataPsmAttribute.dataPsmDatatype ?? "")) ? "default" : "primary"} fullWidth variant="contained" size={"small"} disabled={isLoading} /*onClick={update}*/>Update</Button>
    </Grid>
  </Grid>
  </>;
}
