import React, {FC, useContext, useEffect, useState} from "react";
import {Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, FormHelperText, Grid, IconButton, Input, InputAdornment, InputBase, InputLabel, InputProps, MenuItem, Paper, Select, SelectChangeEvent, Switch, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Typography} from "@mui/material";
import {clone} from "lodash";
import {DeepPartial} from "@dataspecer/core/core/utilities/deep-partial";
import {JsonConfiguration, JsonConfigurator} from "@dataspecer/json/configuration";
import {CsvConfiguration, CsvConfigurator} from "@dataspecer/core/csv-schema/csv-configuration";
import {XmlConfiguration, XmlConfigurator} from "@dataspecer/xml/configuration";
import CloseIcon from '@mui/icons-material/Close';
import {DefaultConfigurationContext} from "../../../application";
import {BikeshedConfiguration, BikeshedConfigurator} from "@dataspecer/core/bikeshed/bikeshed-configuration";

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

  const [currentTab, setCurrentTab] = useState(0);

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
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, i) => setCurrentTab(i)}>
          <Tab label="Schemas" />
          <Tab label="Documentation" />
        </Tabs>
      </Box>
      {currentTab === 0 &&
        <div>
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
        </div>
      }
      {currentTab === 1 &&
        <div>
          <Bikeshed
              input={BikeshedConfigurator.getFromObject(localConfiguration)}
              onChange={u => setLocalConfiguration(BikeshedConfigurator.setToObject(localConfiguration, u))}
              defaultObject={BikeshedConfigurator.getFromObject(defaultConfiguration) as BikeshedConfiguration}
          />
        </div>
      }

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

    <Typography variant="subtitle2" component="h3" sx={{mt: 3}}>Common XML Schema</Typography>
    <TextFieldWithDefault
      label="Common XML Schema external URL"
      current={input ?? {}}
      itemKey="commonXmlSchemaExternalLocation"
      onChange={onChange}
      default={defaultObject}
    />
    <Typography variant="body2" sx={{my: 0}}>
      Leave empty if you wish to bundle the schema with other artifacts.
    </Typography>
  </FormGroup>;
}

/**
 * Part of the dialog where CSV is being configured.
 *
 * The component expects full configuration object.
 * @constructor
 */
const Bikeshed: FC<{
  input: DeepPartial<BikeshedConfiguration>,
  defaultObject?: BikeshedConfiguration
  onChange: (options: DeepPartial<BikeshedConfiguration>) => void,
}> = ({input, onChange, defaultObject}) => {
  return <FormGroup>
    <TextFieldWithDefault
        label="Editors"
        current={input ?? {}}
        itemKey="editor"
        onChange={onChange}
        default={defaultObject}
        inputProps={{fullWidth: true, multiline: true}}
    />
    <TextFieldWithDefault
        label="Abstract"
        current={input ?? {}}
        itemKey="abstract"
        onChange={onChange}
        default={defaultObject}
        inputProps={{fullWidth: true, multiline: true}}
    />
    <Typography variant="subtitle1" component="h2" sx={{mt: 4, mb: 2}}>Additional metadata</Typography>
    <TableRecord
        value={input.otherMetadata ? Object.entries(input.otherMetadata) as [string, string][] : undefined}
        setValue={otherMetadata => {
          if (otherMetadata) {
            onChange({...input, otherMetadata: Object.fromEntries(otherMetadata)})
          } else {
            const result = {...input};
            delete result["otherMetadata"];
            onChange(result);
          }
        }}
        defaultValue={Object.entries(defaultObject?.otherMetadata ?? {})}
    />
  </FormGroup>
}

const TextFieldWithDefault: FC<{
  default?: Record<string, any>,
  current: Record<string, any>,
  itemKey: string,
  onChange: (value: Record<string, any>) => void,
  label: string,
  inputProps?: InputProps,
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
        value={(isDefault ? (!defaultValue ? "-" : defaultValue) : props.current[props.itemKey] as string) ?? ""}
        onChange={e => updateWithValue(e.target.value)}
        endAdornment={props.default && <InputAdornment position="end">
            <IconButton>
              <CloseIcon onClick={toggleDefault} />
            </IconButton>
          </InputAdornment>}
        startAdornment={isDefault && <InputAdornment position="start">Default used: </InputAdornment>}
        {...props.inputProps}
    />
    {props.default && !isDefault && <FormHelperText>(default: {!props.default[props.itemKey] ? "-" : props.default[props.itemKey]})</FormHelperText>}
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

const TableRecord: FC<{
  defaultValue: [string, string][],
  value: [string, string][] | undefined,
  setValue: (value: [string, string][] | undefined) => void
}> = ({defaultValue, value, setValue}) => {
  const isDefault = value === undefined;
  const modifiedValue = value === undefined ? defaultValue : [...value, ["", ""]];
  const update = (index: number, newValue: [string, string]) => {
    const before = modifiedValue.slice(0, index);
    const after = modifiedValue.slice(index + 1);
    const result = ([...before, newValue, ...after] as [string, string][]).filter(q => !q.every(v => v === ""));
    setValue(result);
  }
  const defaultChange = (shallBeDefault: boolean) => {
    if (shallBeDefault) {
      setValue(undefined);
    } else {
      setValue(defaultValue);
    }
  }
  return <>
    <FormControlLabel control={<Checkbox checked={isDefault} onChange={e => defaultChange(e.target.checked)} />} label="Use default value" />
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="left" width="30%">Key</TableCell>
            <TableCell align="left">Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {modifiedValue.map(([key, value], i) => (
              <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <InputBase disabled={isDefault} value={key} sx={isDefault ? undefined : {background: "#00000010", px: 1}} fullWidth onChange={e => update(i, [e.target.value, value])}  />
                </TableCell>
                <TableCell>
                  <InputBase disabled={isDefault} value={value} sx={isDefault ? undefined : {background: "#00000010", px: 1}} fullWidth multiline onChange={e => update(i, [key, e.target.value])} />
                </TableCell>
              </TableRow>
          ))}
          {modifiedValue.length === 0 && <TableCell colSpan={2}><Typography>No rows...</Typography></TableCell>}
        </TableBody>
      </Table>
    </TableContainer>
  </>
}
