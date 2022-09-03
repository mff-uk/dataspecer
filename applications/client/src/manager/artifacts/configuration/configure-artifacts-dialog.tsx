import React, {FC, useEffect, useMemo, useState} from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup, Grid, Switch, TextField, Typography} from "@mui/material";
import {CSV_SCHEMA} from "@dataspecer/core/csv-schema/csv-schema-vocabulary";
import {DefaultArtifactConfiguratorConfiguration} from "@dataspecer/core/data-specification/default-artifact-configurator-configuration";
import {CsvSchemaGeneratorOptions} from "@dataspecer/core/csv-schema/csv-schema-generator-options";
import {XML_SCHEMA} from "@dataspecer/core/xml-schema/xml-schema-vocabulary";
import {XmlSchemaAdapterOptions} from "@dataspecer/core/xml-schema/xml-schema-model-adapter";
import {JSON_SCHEMA} from "@dataspecer/core/json-schema/json-schema-vocabulary";
import {JsonSchemaGeneratorOptions} from "@dataspecer/core/json-schema/json-schema-generator-options";

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

  const rawXmlConfiguration = localConfiguration.generatorOptions[XML_SCHEMA.Generator];
  const xmlConfiguration = useMemo(() =>
      XmlSchemaAdapterOptions.getFromConfiguration(rawXmlConfiguration ?? {}),
    [rawXmlConfiguration]);

  const rawJsonConfiguration = localConfiguration.generatorOptions[JSON_SCHEMA.Generator];
  const jsonConfiguration = useMemo(() =>
      JsonSchemaGeneratorOptions.getFromConfiguration(rawJsonConfiguration ?? {}),
    [rawJsonConfiguration]);

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
      <Typography variant="subtitle1" component="h2">JSON schema</Typography>
      <JsonConfiguration
        input={jsonConfiguration}
        onChange={u => setLocalConfiguration({...localConfiguration, generatorOptions: {...localConfiguration.generatorOptions, [JSON_SCHEMA.Generator]: u}})}
      />

      <Typography variant="subtitle1" component="h2" sx={{mt: 4}}>CSV schema</Typography>
      <CsvConfiguration
        input={csvConfiguration}
        onChange={u => setLocalConfiguration({...localConfiguration, generatorOptions: {...localConfiguration.generatorOptions, [CSV_SCHEMA.Generator]: u}})}
      />

      <Typography variant="subtitle1" component="h2" sx={{mt: 4}}>XSD schema</Typography>
      <XsdConfiguration
        input={xmlConfiguration}
        onChange={u => setLocalConfiguration({...localConfiguration, generatorOptions: {...localConfiguration.generatorOptions, [XML_SCHEMA.Generator]: u}})}
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

const JsonConfiguration: FC<{
  input: JsonSchemaGeneratorOptions,
  onChange: (options: JsonSchemaGeneratorOptions) => void,
}> = ({input, onChange}) => {
  return <FormGroup>
    <Typography variant="subtitle2" component="h3" sx={{mt: 1}}>IRI property and type property names</Typography>
    <Grid container>
      <Grid item xs={6}>
        <TextField label="IRI" variant="standard" value={input.interpretedClassIriPropertyName} onChange={e => onChange({...input, interpretedClassIriPropertyName: e.target.value.length ? e.target.value : null})} />
      </Grid>
      <Grid item xs={6}>
        <TextField label="Type" variant="standard" value={input.interpretedClassTypePropertyName} onChange={e => onChange({...input, interpretedClassTypePropertyName: e.target.value.length ? e.target.value : null})} />
      </Grid>
    </Grid>
    <Typography variant="body2" sx={{my: 2}}>
      Set technical label (key) for properties containing IRI and a type of the entity respectively, for classes that are interpreted. If kept empty, the property will not be generated.
    </Typography>
  </FormGroup>;
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

const XsdConfiguration: FC<{
  input: XmlSchemaAdapterOptions,
  onChange: (options: XmlSchemaAdapterOptions) => void,
}> = ({input, onChange}) => {
  return <FormGroup>
    <Typography variant="subtitle2" component="h3" sx={{mt: 1}}>Root class</Typography>
    <Grid container>
      <Grid item xs={6}>
        <FormControlLabel
          control={<Switch
            checked={input.rootClass.extractGroup}
            onChange={e => onChange({...input, rootClass: {...input.rootClass, extractGroup: e.target.checked}})}
          />}
          label="Extract group"
        />
      </Grid>
      <Grid item xs={6}>
        <FormControlLabel
          control={<Switch
            checked={input.rootClass.extractType}
            onChange={e => onChange({...input, rootClass: {...input.rootClass, extractType: e.target.checked}})}
          />}
          label="Extract type"
        />
      </Grid>
    </Grid>

    <Typography variant="subtitle2" component="h3" sx={{mt: 1}}>Other classes</Typography>
    <Grid container>
      <Grid item xs={6}>
        <FormControlLabel
          control={<Switch
            checked={input.otherClasses.extractGroup}
            onChange={e => onChange({...input, otherClasses: {...input.otherClasses, extractGroup: e.target.checked}})}
          />}
          label="Extract group"
        />
      </Grid>
      <Grid item xs={6}>
        <FormControlLabel
          control={<Switch
            checked={input.otherClasses.extractType}
            onChange={e => onChange({...input, otherClasses: {...input.otherClasses, extractType: e.target.checked}})}
          />}
          label="Extract type"
        />
      </Grid>
    </Grid>
  </FormGroup>;
}
