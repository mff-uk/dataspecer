import { InputProps, FormControl, InputLabel, Input, InputAdornment, IconButton, FormHelperText, SelectChangeEvent, FormControlLabel, Select, MenuItem, Switch, Checkbox, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, InputBase, Typography } from "@mui/material";
import { FC } from "react";
import CloseIcon from "@mui/icons-material/Close";

export const TextFieldWithDefault: FC<{
    default?: Record<string, any>,
    current: Record<string, any>,
    itemKey: string,
    onChange: (value: Record<string, any>) => void,
    label?: string,
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

    return <FormControl variant="standard" disabled={isDefault} fullWidth>
      <InputLabel htmlFor="standard-adornment-password" disabled={false}>{props.label}</InputLabel>
      <Input
          id="standard-adornment-password"
          value={(isDefault ? (!defaultValue ? "-" : defaultValue) : props.current[props.itemKey] as string) ?? ""}
          onChange={e => updateWithValue(e.target.value)}
          endAdornment={props.default && <InputAdornment position="end">
              <IconButton onClick={toggleDefault}>
                <CloseIcon />
              </IconButton>
            </InputAdornment>}
          startAdornment={isDefault && <InputAdornment position="start">Default used: </InputAdornment>}
          {...props.inputProps}
      />
      {props.default && !isDefault && <FormHelperText>(default: {!props.default[props.itemKey] ? "-" : props.default[props.itemKey]})</FormHelperText>}
    </FormControl>;
  };

export const SwitchWithDefault: FC<{
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
  };

export const SelectWithDefault = <Keys extends string,>(props: {
  default?: Record<Keys, any>,
  current: Partial<Record<Keys, any>>,
  itemKey: Keys,
  onChange: (value: Record<string, any>) => void,
  label?: string,
  options: Record<string, string>,
}) => {
  const handleChange = (event: SelectChangeEvent<number>) => {
    const val = event.target.value;
    if (val === -1) {
      const result = {...props.current};
      delete result[props.itemKey];
      props.onChange(result);
    } else {
      props.onChange({...props.current, [props.itemKey]: val});
    }
  };

  return <FormControl variant="standard" fullWidth>
    <InputLabel htmlFor="standard-adornment-password">{props.label}</InputLabel>
    <Select
        variant="standard"
        value={props.current.hasOwnProperty(props.itemKey) ? props.current[props.itemKey] : -1}
        onChange={handleChange}
      >
        {props.default && <MenuItem value={-1}>Default ({props.options[props.default[props.itemKey]]})</MenuItem>}
        {Object.entries(props.options).map(([key, value]) => <MenuItem value={key} key={key}>{value}</MenuItem>)}
      </Select>
  </FormControl>;
}

export const TableRecord: FC<{
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
