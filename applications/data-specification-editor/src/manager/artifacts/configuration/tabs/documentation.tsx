import { DeepPartial } from "@dataspecer/core/core/utilities/deep-partial";
import { TemplateArtifactConfiguration } from "@dataspecer/template-artifact/configuration";
import { Box, FormGroup, Typography } from "@mui/material";
import { FC } from "react";
import { TextFieldWithDefault } from "../ui-components/index";

const TEMPLATE_BUILDING_BLOCKS = [
  "metadata",
  "abstract",
  "artifactList",
  "conceptualModel",
];

export const Documentation: FC<{
  input: DeepPartial<TemplateArtifactConfiguration>,
  defaultObject?: TemplateArtifactConfiguration
  onChange: (options: DeepPartial<TemplateArtifactConfiguration>) => void,
}> = ({input, onChange, defaultObject}) => {
  return <FormGroup>
    <Typography variant="h6">Input template</Typography>
    <TextFieldWithDefault
        label={"The template"}
        default={defaultObject}
        current={input ?? {}}
        itemKey={"template"}
        onChange={onChange}
        inputProps={{fullWidth: true, multiline: true}}
    />
    <Typography variant="h6" sx={{mt: 6}}>Template building blocks</Typography>
    {TEMPLATE_BUILDING_BLOCKS.map(buildingBlock => <>
      <TextFieldWithDefault
          label={buildingBlock + " template"}
          current={input.templates ?? {}}
          itemKey={buildingBlock}
          onChange={templates => onChange({...input, templates})}
          default={defaultObject.templates}
          inputProps={{fullWidth: true, multiline: true}}
      />
      <Box mt={2} />
    </>)}
  </FormGroup>
}
