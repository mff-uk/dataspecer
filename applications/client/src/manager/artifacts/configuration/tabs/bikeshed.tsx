import { BikeshedConfiguration } from "@dataspecer/bikeshed";
import { DeepPartial } from "@dataspecer/core/core/utilities/deep-partial";
import { FormGroup, Box, Typography } from "@mui/material";
import { FC } from "react";
import { SelectWithDefault, TextFieldWithDefault, TableRecord } from "../ui-components/index";

const BIKESHED_LANGUAGES = {"cs": "cs", "en": "en"};

/**
 * Part of the dialog where CSV is being configured.
 *
 * The component expects full configuration object.
 * @constructor
 */
export const Bikeshed: FC<{
  input: DeepPartial<BikeshedConfiguration>,
  defaultObject?: BikeshedConfiguration
  onChange: (options: DeepPartial<BikeshedConfiguration>) => void,
}> = ({input, onChange, defaultObject}) => {
  return <FormGroup>
    <SelectWithDefault
        label={"Language"}
        default={defaultObject}
        current={input ?? {}}
        itemKey={"language"}
        onChange={onChange}
        options={BIKESHED_LANGUAGES}
    />
    <Box mt={2} />
    <TextFieldWithDefault
        label="Editors"
        current={input ?? {}}
        itemKey="editor"
        onChange={onChange}
        default={defaultObject}
        inputProps={{fullWidth: true, multiline: true}}
    />
    <Box mt={2} />
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