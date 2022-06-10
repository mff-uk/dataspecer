import React, {FC, useEffect, useMemo, useState} from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup, Switch, Typography} from "@mui/material";
import {CSV_SCHEMA} from "@dataspecer/core/csv-schema/csv-schema-vocabulary";
import {DefaultArtifactConfiguratorConfiguration} from "@dataspecer/core/data-specification/default-artifact-configurator-configuration";
import {CsvSchemaGeneratorOptions} from "@dataspecer/core/csv-schema/csv-schema-generator-options";

/**
 * Main component (Dialog) for the configuration of the artifacts.
 */
export const ConfigureArtifactsDialog: FC<{
  isOpen: boolean,
  close: () => void,
  onChange: (configuration: DefaultArtifactConfiguratorConfiguration) => void,
  configuration: DefaultArtifactConfiguratorConfiguration,
}> = ({isOpen, close, onChange, configuration}) => {

  // Local configuration changes with dialog being opened.

  const [localConfiguration, setLocalConfiguration] = useState(() => DefaultArtifactConfiguratorConfiguration.create(configuration));
  useEffect(() => {
    if (isOpen) {
      setLocalConfiguration(DefaultArtifactConfiguratorConfiguration.create(configuration))
    }
  }, [isOpen, configuration]);

  const rawCsvConfiguration = localConfiguration.generatorOptions[CSV_SCHEMA.Generator];
  const csvConfiguration = useMemo(() =>
    CsvSchemaGeneratorOptions.getFromConfiguration(rawCsvConfiguration ?? {}),
    [rawCsvConfiguration]);

  return <Dialog
    open={isOpen}
    onClose={close}
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle>
      Configure artifacts
    </DialogTitle>
    <DialogContent>
      <Typography variant="subtitle1" component="h2">CSV schema</Typography>
      <CsvConfiguration
        input={csvConfiguration}
        onChange={u => setLocalConfiguration({...localConfiguration, generatorOptions: {...localConfiguration.generatorOptions, [CSV_SCHEMA.Generator]: u}})}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={close}>Discard</Button>
      <Button onClick={() => {
        onChange(localConfiguration);
        close();
      }}>Save</Button>
    </DialogActions>
  </Dialog>;
}

/**
 * Part of the dialog where CSV is being configured.
 *
 * The component expects full configuration object.
 * @constructor
 */
const CsvConfiguration: FC<{
  input: CsvSchemaGeneratorOptions,
  onChange: (options: CsvSchemaGeneratorOptions) => void,
}> = ({input, onChange}) => {
  return <FormGroup>
    <FormControlLabel
      control={<Switch
        checked={input.enableMultipleTableSchema}
        onChange={e => onChange({...input, enableMultipleTableSchema: e.target.checked})}
      />}
      label="Enable multiple table schema for CSV"
    />
  </FormGroup>
}
