import { DeepPartial } from "@dataspecer/core/core/utilities/deep-partial";
import { XmlConfiguration } from "@dataspecer/xml/configuration";
import { FormGroup, Typography, Grid } from "@mui/material";
import { FC } from "react";
import { SwitchWithDefault, TextFieldWithDefault } from "../ui-components/index";

export const Xml: FC<{
    input: DeepPartial<XmlConfiguration>,
    defaultObject?: XmlConfiguration
    onChange: (options: DeepPartial<XmlConfiguration>) => void,
  }> = ({input, onChange, defaultObject}) => {
    return <FormGroup>
      <Grid container>
        {/* <Grid item xs={6}>
          <SwitchWithDefault
              label="Extract group"
              current={input.rootClass ?? {}}
              itemKey="extractGroup"
              onChange={rootClass => onChange({...input, rootClass})}
              default={defaultObject?.rootClass}
              />
              </Grid> */}
        <Grid item xs={6}>
          <Typography variant="subtitle2" component="h3" sx={{mt: 1}}>Root class</Typography>
          <SwitchWithDefault
              label="Extract type"
              current={input.rootClass ?? {}}
              itemKey="extractType"
              onChange={rootClass => onChange({...input, rootClass})}
              default={defaultObject?.rootClass}
          />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2" component="h3" sx={{mt: 1}}>Other classes</Typography>
          <SwitchWithDefault
              label="Extract type"
              current={input.otherClasses ?? {}}
              itemKey="extractType"
              onChange={otherClasses => onChange({...input, otherClasses})}
              default={defaultObject?.otherClasses}
          />
        </Grid>
        {/* <Grid item xs={6}>
          <SwitchWithDefault
              label="Extract group"
              current={input.otherClasses ?? {}}
              itemKey="extractGroup"
              onChange={otherClasses => onChange({...input, otherClasses})}
              default={defaultObject?.otherClasses}
          />
        </Grid> */}
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