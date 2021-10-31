import React, {FormEvent, memo} from "react";
import {Autocomplete, Box, Chip, IconButton, TextField, Typography} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {useTranslation} from "react-i18next";

interface KnownDatatype {
    prefLabel: string;
    prefix: string;
    localPart: string;
    documentation: string;
    iri: string;
}

export type DatatypeSelectorValueType = string | KnownDatatype;

interface DatatypeSelectorParameters {
    value: DatatypeSelectorValueType;
    onChange: (value: DatatypeSelectorValueType) => void;

    options: KnownDatatype[];
}

export const getIriFromDatatypeSelectorValue = (value: string | KnownDatatype | null) => {
    if (typeof value === 'object' && value) {
        return value.iri;
    }
    if (typeof value === 'string') {
        return value;
    }
    return null;
}

/**
 * Allows user select a data type from a list of pre-defined types or by typing a custom IRI.
 * Because user may want to set a type whose prefix is a well-known type (for example string-only-ascii vs string) we
 * must not immediately replace the user text with well-known types. Therefore the complexity of value prop.
 */
export const DatatypeSelector: React.FC<DatatypeSelectorParameters> = memo(({value, onChange, options}) => {
    const {t} = useTranslation("detail");

    // Whether the value is non-null object
    const valueIsKnown = typeof value === 'object' && value;

    return <Autocomplete
        autoHighlight

        freeSolo
        value={valueIsKnown ? value : undefined}
        disableClearable

        onChange={(event, newValue) => {
            if (typeof newValue !== "string") {
                onChange(newValue);
            }
        }}

        renderOption={(props, option: KnownDatatype) => (
            <Box component="li" {...props} sx={{display: "flex", gap: "1rem"}}>
                <Box>
                    {option.prefix}:<strong>{option.localPart}</strong>
                </Box>
                <Typography color={"gray"} sx={{flexGrow: 1, textOverflow: 'ellipsis', overflow: "hidden"}}>
                    {option.iri}
                </Typography>
                <IconButton href={option.documentation} target="_blank">
                    <OpenInNewIcon/>
                </IconButton>
            </Box>
        )}
        // Used for searching.
        getOptionLabel={datatype => `${datatype.prefix}:${datatype.localPart}\0${datatype.iri}\0${datatype.prefLabel}`}
        renderInput={(params) => {
            return <TextField
                {...params}
                label={t('label datatype')}
                InputProps={{
                    ...params.InputProps,
                    startAdornment: valueIsKnown ? <Chip size="small" color="primary" label={value.prefix + ":" + value.localPart} onDelete={() => {
                        onChange("")
                    }}/> : null,
                }}
                inputProps={{
                    ...params.inputProps,
                    autoComplete: 'new-password',
                    value: valueIsKnown ? "" : value,
                    onChange: (event: FormEvent<HTMLInputElement>) => {
                        onChange((event.target as HTMLInputElement).value);
                        (params.inputProps.onChange as React.FormEventHandler<HTMLInputElement>)(event);
                    },
                    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
                        if (event.key === "Backspace" && valueIsKnown) {
                            onChange("");
                        }
                        if (params.inputProps.onKeyDown) {
                            params.inputProps.onKeyDown(event);
                        }
                    }

                }}
                variant="filled"
            />
        }}
        options={options}
    />
});
