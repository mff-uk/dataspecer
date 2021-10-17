import React, {useCallback, useEffect, useState} from "react";
import {DataPsmAttribute} from "model-driven-data/data-psm/model";
import {Button, Grid, TextField, Typography} from "@material-ui/core";
import {StoreContext} from "../../../App";
import {useTranslation} from "react-i18next";
import {SetDataPsmDatatype} from "../../../../operations/set-data-psm-datatype";

export const UpdateDataType: React.FC<{dataPsmAttribute: DataPsmAttribute, isLoading: boolean}> = ({dataPsmAttribute, isLoading}) => {
  const {t} = useTranslation("psm.detail");
  const {store} = React.useContext(StoreContext);
  const [value, setValue] = useState<string>("");
  useEffect(() => setValue(dataPsmAttribute.dataPsmDatatype ?? ""), [dataPsmAttribute.dataPsmDatatype]);

  const update = useCallback(() => store.executeOperation(new SetDataPsmDatatype(dataPsmAttribute.iri as string, value))
      , [store, value, dataPsmAttribute.iri]);

  return <>
    <Typography variant="h6" component="h3">{t("datatype")}</Typography>
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={8}>
        <TextField
            value={value}
            onChange={event => setValue(event.target.value)}
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
        <Button color={(value == (dataPsmAttribute.dataPsmDatatype ?? "")) ? "default" : "primary"} fullWidth variant="contained" size={"small"} disabled={isLoading} onClick={update}>{t("update")}</Button>
      </Grid>
    </Grid>
  </>;
}
