import { BikeshedConfiguration } from "@dataspecer/bikeshed";
import { DeepPartial } from "@dataspecer/core/core/utilities/deep-partial";
import {FormGroup, Box, Typography, Grid} from "@mui/material";
import { FC } from "react";
import {SelectWithDefault, TextFieldWithDefault, TableRecordWithDefault, SwitchWithDefault} from "../ui-components/index";

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

    <Typography variant="h6" sx={{mt: 6}}>Additional metadata</Typography>
    <TableRecordWithDefault
        value={input.otherMetadata ? Object.entries(input.otherMetadata) as [string, string][] : undefined}
        onValueChange={otherMetadata => {
          if (otherMetadata) {
            onChange({...input, otherMetadata: Object.fromEntries(otherMetadata)})
          } else {
            const result = {...input};
            delete result["otherMetadata"];
            onChange(result);
          }
        }}
        defaultValue={defaultObject ? Object.entries(defaultObject?.otherMetadata ?? {}) : undefined}
    />

    <Typography variant="h6" sx={{mt: 6}}>Other settings</Typography>
    <Grid container rowGap={1}>
      <Grid item xs={12}>
        <SwitchWithDefault
            current={input ?? {}}
            itemKey="useTechnicalLabelsInStructuralModels"
            onChange={onChange}
            default={defaultObject}
            label={"Use technical labels in structural model description"}
        />
      </Grid>
    </Grid>
  </FormGroup>
}
