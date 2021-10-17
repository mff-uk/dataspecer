import React, {useCallback, useEffect, useState} from "react";
import {DataPsmResource} from "model-driven-data/data-psm/model";
import {Button, Grid, TextField, Typography} from "@material-ui/core";
import {StoreContext} from "../../../App";
import {useTranslation} from "react-i18next";
import {SetTechnicalLabel} from "../../../../operations/set-technical-label";

export const UpdateTechnicalLabel: React.FC<{dataPsmResource: DataPsmResource, isLoading: boolean}> = ({dataPsmResource, isLoading}) => {
  const {t} = useTranslation("psm.detail");
  const {store} = React.useContext(StoreContext);
  const [technicalLabel, setTechnicalLabel] = useState<string>("");
  useEffect(() => setTechnicalLabel(dataPsmResource.dataPsmTechnicalLabel ?? ""), [dataPsmResource.dataPsmTechnicalLabel]);

  const update = useCallback(() => store.executeOperation(new SetTechnicalLabel(dataPsmResource.iri as string, technicalLabel)),
      [store, technicalLabel, dataPsmResource.iri]);

  return <>
    <Typography variant="h6" component="h3">{t("technical label")}</Typography>
  <Grid container spacing={2} alignItems="center">
    <Grid item xs={8}>
      <TextField
          value={technicalLabel}
          onChange={event => setTechnicalLabel(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter") {
              event.preventDefault();
              update();
            }
          }}
          fullWidth
          disabled={isLoading}
      />
    </Grid>
    <Grid item xs={4}>
      <Button color={(technicalLabel == (dataPsmResource.dataPsmTechnicalLabel ?? "")) ? "default" : "primary"} fullWidth variant="contained" size={"small"} disabled={isLoading} onClick={update}>{t("update")}</Button>
    </Grid>
  </Grid>
  </>;
}
