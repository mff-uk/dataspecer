import React, {FC, useContext, useEffect, useState} from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, FormHelperText, Grid, IconButton, Input, InputAdornment, InputLabel, MenuItem, Select, SelectChangeEvent, Switch, Typography} from "@mui/material";
import {clone} from "lodash";
import {DeepPartial} from "@dataspecer/core/core/utilities/deep-partial";
import {JsonConfiguration, JsonConfigurator} from "@dataspecer/core/json/json-configuration";
import {CsvConfiguration, CsvConfigurator} from "@dataspecer/core/csv-schema/csv-configuration";
import {XmlConfiguration, XmlConfigurator} from "@dataspecer/core/xml/xml-configuration";
import CloseIcon from '@mui/icons-material/Close';
import {DefaultConfigurationContext} from "../../../application";

/**
 * Dialog that edits configuration.
 */
export const ConfigureArtifactsDialog: FC<{
  isOpen: boolean,
  close: () => void,
  onChange: (configuration: object) => void,
  configuration: object,
}> = ({isOpen, close, onChange, configuration}) => {
  const defaultConfiguration = useContext(DefaultConfigurationContext);
  const [localConfiguration, setLocalConfiguration] = useState(() => clone(configuration));
  useEffect(() => {
    if (isOpen) {
      setLocalConfiguration(clone(configuration))
    }
  }, [isOpen, configuration]);

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
      <Json
        input={JsonConfigurator.getFromObject(localConfiguration)}
        onChange={u => setLocalConfiguration(JsonConfigurator.setToObject(localConfiguration, u))}
        defaultObject={JsonConfigurator.getFromObject(defaultConfiguration) as JsonConfiguration}
      />

      <Typography variant="subtitle1" component="h2" sx={{mt: 4}}>CSV schema</Typography>
      <Csv
        input={CsvConfigurator.getFromObject(localConfiguration)}
        onChange={u => setLocalConfiguration(CsvConfigurator.setToObject(localConfiguration, u))}
        defaultObject={CsvConfigurator.getFromObject(defaultConfiguration) as CsvConfiguration}
      />

      <Typography variant="subtitle1" component="h2" sx={{mt: 4}}>XSD schema</Typography>
      <Xml
        input={XmlConfigurator.getFromObject(localConfiguration)}
        onChange={u => setLocalConfiguration(XmlConfigurator.setToObject(localConfiguration, u))}
        defaultObject={XmlConfigurator.getFromObject(defaultConfiguration) as XmlConfiguration}
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

const Json: FC<{
  input: DeepPartial<JsonConfiguration>,
  defaultObject?: JsonConfiguration,
  onChange: (options: DeepPartial<JsonConfiguration>) => void,
}> = ({input, onChange, defaultObject}) => {
  return <FormGroup>
    <Typography variant="subtitle2" component="h3" sx={{mt: 1}}>IRI property and type property names</Typography>
    <Grid container>
      <Grid item xs={6}>
        <TextFieldWithDefault
            label="IRI"
            current={input ?? {}}
            itemKey="jsonIdKeyAlias"
            onChange={onChange}
            default={defaultObject}
        />
      </Grid>
      <Grid item xs={6}>
        <TextFieldWithDefault
            label="Type"
            current={input ?? {}}
            itemKey="jsonTypeKeyAlias"
            onChange={onChange}
            default={defaultObject}
        />
      </Grid>
    </Grid>
    <Typography variant="body2" sx={{my: 2}}>
      Set technical label (key) for properties containing IRI and a type of the entity respectively, for classes that are interpreted. If kept empty, the property will not be generated.
    </Typography>
    <Grid container>
      <Grid item xs={6}>
        <TextFieldWithDefault
            label="Language key for types"
            current={input ?? {}}
            itemKey="jsonTypeKeyMappingTypeLabel"
            onChange={onChange}
            default={defaultObject}
        />
      </Grid>
      <Grid item xs={6}>
      </Grid>
    </Grid>
  </FormGroup>;
}

/**
 * Part of the dialog where CSV is being configured.
 *
 * The component expects full configuration object.
 * @constructor
 */
const Csv: FC<{
  input: DeepPartial<CsvConfiguration>,
  defaultObject?: CsvConfiguration
  onChange: (options: DeepPartial<CsvConfiguration>) => void,
}> = ({input, onChange, defaultObject}) => {
  return <FormGroup>
    <SwitchWithDefault
        label="Enable multiple table schema for CSV"
        current={input ?? {}}
        itemKey="enableMultipleTableSchema"
        onChange={onChange}
        default={defaultObject}
    />
  </FormGroup>
}

const Xml: FC<{
  input: DeepPartial<XmlConfiguration>,
  defaultObject?: XmlConfiguration
  onChange: (options: DeepPartial<XmlConfiguration>) => void,
}> = ({input, onChange, defaultObject}) => {
  return <FormGroup>
    <Typography variant="subtitle2" component="h3" sx={{mt: 1}}>Root class</Typography>
    <Grid container>
      <Grid item xs={6}>
        <SwitchWithDefault
            label="Extract group"
            current={input.rootClass ?? {}}
            itemKey="extractGroup"
            onChange={rootClass => onChange({...input, rootClass})}
            default={defaultObject?.rootClass}
        />
      </Grid>
      <Grid item xs={6}>
        <SwitchWithDefault
            label="Extract type"
            current={input.rootClass ?? {}}
            itemKey="extractType"
            onChange={rootClass => onChange({...input, rootClass})}
            default={defaultObject?.rootClass}
        />
      </Grid>
    </Grid>

    <Typography variant="subtitle2" component="h3" sx={{mt: 1}}>Other classes</Typography>
    <Grid container>
      <Grid item xs={6}>
        <SwitchWithDefault
            label="Extract group"
            current={input.otherClasses ?? {}}
            itemKey="extractGroup"
            onChange={otherClasses => onChange({...input, otherClasses})}
            default={defaultObject?.otherClasses}
        />
      </Grid>
      <Grid item xs={6}>
        <SwitchWithDefault
            label="Extract type"
            current={input.otherClasses ?? {}}
            itemKey="extractType"
            onChange={otherClasses => onChange({...input, otherClasses})}
            default={defaultObject?.otherClasses}
        />
      </Grid>
    </Grid>
  </FormGroup>;
}

const TextFieldWithDefault: FC<{
  default?: Record<string, any>,
  current: Record<string, any>,
  itemKey: string,
  onChange: (value: Record<string, any>) => void,
  label: string,
}> = (props) => {
  const isDefault = props.default && !props.current.hasOwnProperty(props.itemKey);
  const defaultValue = props.default && props.default.hasOwnProperty(props.itemKey) ? props.default[props.itemKey] : null;
  const updateWithValue = (value: string) => {
    props.onChange({...props.current, [props.itemKey]: value ?? null});
  }
  const toggleDefault = () => {
    if (props.default) {
      if (isDefault) {
        updateWithValue(defaultValue);
      } else {
        const result = {...props.current};
        delete result[props.itemKey];
        props.onChange(result);
      }
    }
  }

  return <FormControl sx={{ m: 1 }} variant="standard" disabled={isDefault}>
    <InputLabel htmlFor="standard-adornment-password">{props.label}</InputLabel>
    <Input
        id="standard-adornment-password"
        value={(isDefault ? defaultValue : props.current[props.itemKey] as string) ?? ""}
        onChange={e => updateWithValue(e.target.value)}
        endAdornment={props.default && <InputAdornment position="end">
            <IconButton>
              <CloseIcon onClick={toggleDefault} />
            </IconButton>
          </InputAdornment>}
        startAdornment={isDefault && <InputAdornment position="start">Default used: </InputAdornment>}
    />
    {props.default && !isDefault && <FormHelperText>(default: {props.default[props.itemKey]})</FormHelperText>}
  </FormControl>;
}

const SwitchWithDefault: FC<{
  default?: Record<string, any>,
  current: Record<string, any>,
  itemKey: string,
  onChange: (value: Record<string, any>) => void,
  label: string,
}> = (props) => {
  const handleChange = (event: SelectChangeEvent<number>) => {
    const val = event.target.value;
    if (val === -1) {
      const result = {...props.current};
      delete result[props.itemKey];
      props.onChange(result);
    } else {
      props.onChange({...props.current, [props.itemKey]: val === 1});
    }
  };

  return <FormControlLabel
      control={props.default ?
        <Select
            variant="standard"
            sx={{mx: 2}}
            value={props.current.hasOwnProperty(props.itemKey) ? (props.current[props.itemKey] ? 1 : 0) : -1}
            onChange={handleChange}
        >
          <MenuItem value={-1}>Default ({props.default[props.itemKey] ? "Yes" : "No"})</MenuItem>
          <MenuItem value={1}>Yes</MenuItem>
          <MenuItem value={0}>No</MenuItem>
        </Select> :
        <Switch
          checked={props.current[props.itemKey] as boolean}
          onChange={e => props.onChange({...props.current, [props.itemKey]: e.target.checked})}
          />
      }
      label={props.label}
  />
}
