import { DeepPartial } from "@dataspecer/core/core/utilities/deep-partial";
import { JsonConfiguration } from "@dataspecer/json/configuration";
import { FormGroup, Typography, Grid, Collapse } from "@mui/material";
import { FC } from "react";
import { SelectWithDefault, SwitchWithDefault, TextFieldWithDefault } from "../ui-components/index";

export const Json: FC<{
    input: DeepPartial<JsonConfiguration>,
    defaultObject?: JsonConfiguration,
    onChange: (options: DeepPartial<JsonConfiguration>) => void,
  }> = ({input, onChange, defaultObject}) => {
    return <FormGroup>
      <Typography variant="h6">IRI and type property names</Typography>
      <Grid container spacing={2}>
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
      <Typography variant="body2" sx={{mt: 1}}>
        Set technical label (key) for properties containing IRI and a type of the entity respectively, for classes that are interpreted.
      </Typography>


      <Typography variant="h6" sx={{mt: 6}}>JSON-LD @base IRI</Typography>
      <Grid container>
        <Grid item xs={12}>
          <TextFieldWithDefault
              current={input ?? {}}
              itemKey="jsonLdBaseUrl"
              onChange={onChange}
              default={defaultObject}
          />
        </Grid>
      </Grid>


      <Typography variant="h6" sx={{mt: 6}}>Root cardinality</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <SelectWithDefault
              current={input ?? {}}
              itemKey="jsonRootCardinality"
              onChange={onChange}
              default={defaultObject}
              options={{
                "single": "Single item",
                "object-with-array": "Object having an array",
                "array": "Array of items",
              }}
          />
        </Grid>
        <Grid item xs={6}>
          <Collapse in={input.jsonRootCardinality === "object-with-array"} appear={false} orientation="horizontal">
            <TextFieldWithDefault
                label="Root key"
                current={input ?? {}}
                itemKey="jsonRootCardinalityObjectKey"
                onChange={onChange}
                default={defaultObject}
            />
          </Collapse>
        </Grid>
      </Grid>
      <Typography variant="body2" sx={{mt: 1}}>
        Select whether the generated JSON schema and JSON-LD context will represent a single item, an array of those items, or an object with a single key containing an array of the items.
      </Typography>


      <Typography variant="h6" sx={{mt: 6}}>@type key mapping</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <SelectWithDefault
              current={input ?? {}}
              itemKey="jsonDefaultTypeKeyMapping"
              onChange={onChange}
              default={defaultObject}
              options={{
                "human-label": "Use human label",
                "technical-label": "Use technical label",
              }}
          />
        </Grid>
        <Grid item xs={6}>
          <Collapse in={input.jsonDefaultTypeKeyMapping === "human-label"} appear={false} orientation="horizontal">
            <TextFieldWithDefault
                label="Preffered language"
                current={input ?? {}}
                itemKey="jsonDefaultTypeKeyMappingHumanLabelLang"
                onChange={onChange}
                default={defaultObject}
            />
          </Collapse>
        </Grid>
      </Grid>
      <Typography variant="body2" sx={{mt: 1}}>
        Specifies what will be used for the individual types for the @type property in JSON-LD.
      </Typography>


      <Typography variant="h6" sx={{mt: 6}}>References</Typography>
      <Grid container rowGap={1}>
        <Grid item xs={12}>
          <SwitchWithDefault
            current={input ?? {}}
            itemKey="dereferenceSchema"
            onChange={onChange}
            default={defaultObject}
            label={"Dereference JSON Schemas"}
          />
        </Grid>
        <Grid item xs={12}>
          <SwitchWithDefault
              current={input ?? {}}
              itemKey="dereferenceContext"
              onChange={onChange}
              default={defaultObject}
              label={"Dereference JSON-LD Contexts"}
          />
        </Grid>
      </Grid>
      <Typography variant="body2" sx={{mt: 1}}>
        Resolves all <code>$ref</code>/<code>@context</code> references in the generated files.
      </Typography>
    </FormGroup>;
  };
