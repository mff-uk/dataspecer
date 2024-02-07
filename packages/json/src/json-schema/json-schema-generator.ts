import {
  DataSpecification,
  DataSpecificationArtefact,
  DataSpecificationSchema,
} from "@dataspecer/core/data-specification/model";
import { StreamDictionary } from "@dataspecer/core/io/stream/stream-dictionary";
import { ArtefactGenerator, ArtefactGeneratorContext } from "@dataspecer/core/generator";
import { JsonSchema } from "./json-schema-model";
import { writeJsonSchema } from "./json-schema-writer";
import { structureModelToJsonSchema } from "./json-schema-model-adapter";
import { assertFailed, assertNot } from "@dataspecer/core/core";
import {
  structureModelAddDefaultValues,
  transformStructureModel
} from "@dataspecer/core/structure-model/transformation";
import { createBikeshedSchemaJson } from "./json-schema-to-bikeshed";
import { BIKESHED, BikeshedAdapterArtefactContext } from "@dataspecer/bikeshed";
import { JSON_SCHEMA } from "./json-schema-vocabulary";
import { structureModelAddIdAndTypeProperties } from "./json-id-transformations";
import {DefaultJsonConfiguration, JsonConfiguration, JsonConfigurator} from "../configuration";
import {structureModelAddJsonProperties} from "../json-structure-model/add-json-properties";
import {DataSpecificationConfigurator, DefaultDataSpecificationConfiguration, DataSpecificationConfiguration} from "@dataspecer/core/data-specification/configuration";
import { StructureModel } from "@dataspecer/core/structure-model/model";
import { ConceptualModel, ConceptualModelProperty } from "@dataspecer/core/conceptual-model";
import { pathRelative } from "@dataspecer/core/core/utilities/path-relative";

export class JsonSchemaGenerator implements ArtefactGenerator {
  identifier(): string {
    return JSON_SCHEMA.Generator;
  }

  async generateToStream(
      context: ArtefactGeneratorContext,
      artefact: DataSpecificationArtefact,
      specification: DataSpecification,
      output: StreamDictionary
  ) {
    const model = (await this.generateToObject(context, artefact, specification)).jsonSchema;
    const stream = output.writePath(artefact.outputPath);
    await writeJsonSchema(model, stream);
    await stream.close();
  }

  async generateToObject(
      context: ArtefactGeneratorContext,
      artefact: DataSpecificationArtefact,
      specification: DataSpecification,
      skipIdAndTypeProperties = false
  ): Promise<{
    structureModel: StructureModel,
    jsonSchema: JsonSchema,
    mergedConceptualModel: ConceptualModel,
    configuration: JsonConfiguration,
    globalConfiguration: DataSpecificationConfiguration
  }> {
    if (!DataSpecificationSchema.is(artefact)) {
      assertFailed("Invalid artefact type.");
    }
    const schemaArtefact = artefact as DataSpecificationSchema;
    const conceptualModel = context.conceptualModels[specification.pim];
    // Options for the JSON generator
    const configuration = JsonConfigurator.merge(
        DefaultJsonConfiguration,
        JsonConfigurator.getFromObject(schemaArtefact.configuration)
    ) as JsonConfiguration;
    // Global options for the data specification
    const globalConfiguration = DataSpecificationConfigurator.merge(
        DefaultDataSpecificationConfiguration,
        DataSpecificationConfigurator.getFromObject(schemaArtefact.configuration)
    ) as DataSpecificationConfiguration;
    assertNot(
        conceptualModel === undefined,
        `Missing conceptual model ${specification.pim}.`
    );
    let structureModel = context.structureModels[schemaArtefact.psm];
    assertNot(
        structureModel === undefined,
        `Missing structure model ${schemaArtefact.psm}.`
    );
    structureModel = await structureModelAddJsonProperties(structureModel, context.reader);
    const mergedConceptualModel = {...conceptualModel};
    mergedConceptualModel.classes = Object.fromEntries(Object.values(context.conceptualModels).map(cm => Object.entries(cm.classes)).flat());
    structureModel = transformStructureModel(mergedConceptualModel, structureModel, Object.values(context.specifications));
    structureModel = structureModelAddDefaultValues(structureModel, globalConfiguration);
    if (!skipIdAndTypeProperties) {
      structureModel = structureModelAddIdAndTypeProperties(structureModel, configuration);
    }
    const jsonSchema = structureModelToJsonSchema(context.specifications, specification, structureModel, configuration, artefact);

    return {structureModel, jsonSchema, mergedConceptualModel, configuration, globalConfiguration}
  }

  // todo add structureModelAddIdAndTypeProperties
  async generateForDocumentation(
      context: ArtefactGeneratorContext,
      artefact: DataSpecificationArtefact,
      specification: DataSpecification,
      documentationIdentifier: string,
      callerContext: unknown
  ): Promise<unknown | null> {
    if (documentationIdentifier === BIKESHED.Generator) {
      const bikeshedContext = callerContext as BikeshedAdapterArtefactContext;
      return createBikeshedSchemaJson({
        ...bikeshedContext,
        structureModel: transformStructureModel(
            bikeshedContext.conceptualModel,
            bikeshedContext.structureModel,
            Object.values(context.specifications)
        ),
      });
    } else if (documentationIdentifier === "https://schemas.dataspecer.com/generator/template-artifact") {
      const {artifact: documentationArtefact} = callerContext as {artifact: DataSpecificationArtefact};

      const {structureModel, jsonSchema, mergedConceptualModel, configuration} = await this.generateToObject(context, artefact, specification, true);
      const conceptualModelProperties: Record<string, ConceptualModelProperty> = {};
      Object.values(mergedConceptualModel.classes).forEach(cls => {
        cls.properties.forEach(prop => {
          conceptualModelProperties[prop.pimIri] = prop;
        });
      });
      structureModel.getClasses().forEach(cls => {
        // @ts-ignore
        cls.pimClass = mergedConceptualModel.classes[cls.pimIri];
        // @ts-ignore
        cls.inThisSchema = !((cls.structureSchema !== structureModel.psmIri) || cls.isReferenced);
        cls.properties.forEach(prop => {
          // @ts-ignore
          prop.pimAssociation = conceptualModelProperties[prop.pimIri];

          prop.dataTypes.forEach(dt => {
            if (dt.isAssociation()) {
              const target = dt.dataType;
              if (target.structureSchema !== (artefact as DataSpecificationSchema).psm || target.isReferenced) {
                // if the property points to an external class, we need link to bs documentation

                const externalSpecification = context.specifications[target.specification];
                const externalArtefact = externalSpecification.artefacts.find(a => a.generator == "https://schemas.dataspecer.com/generator/template-artifact");

                // @ts-ignore
                dt.externalDocumentation = pathRelative(
                  documentationArtefact.publicUrl,
                  externalArtefact.publicUrl,
                )
              }
            }
          });
        });
      });
      return {
        structureModel,
        jsonSchema,
        configuration,
        classes: await structureModel.getClasses(),
        useTemplate: () => (template, render) => {
          if (template.trim() !== "") {
            return render(template);
          } else {
            let infoText = "Datová sada je tvořena ";
            switch (configuration.jsonRootCardinality) {
              case "single":
                infoText += "jediným prvkem odpovídající datové struktuře";
                break;
              case "array":
                infoText += "seznamem prvků odpovídajících datové struktuře";
                break;
              case "object-with-array":
                infoText += "seznamem prvků odpovídajících datové struktuře";
                break;
              default:
                assertFailed("Unknown cardinality.");
            }

            let infoText2 = configuration.jsonRootCardinality === "object-with-array" ? ` Prvky jsou uvedeny v poli \`${configuration.jsonRootCardinalityObjectKey}\`.` : "";

            // @ts-ignore
            if (documentationArtefact.templateType === "respec") {
              return render(`<section>
<h3>Přehled JSON struktury</h3>
<p>JSON Schéma zachycující stukturu pro <i>{{#humanLabel}}{{translate}}{{/humanLabel}}</i> je definováno v souboru <a href="{{{artifact.json-schema.relativePath}}}"><code>{{artifact.json-schema.relativePath}}</code></a>. ${infoText} <i>{{#structureModel}}{{#roots}}{{#classes}}{{#humanLabel}}{{translate}}{{/humanLabel}}{{/classes}}{{/roots}}{{/structureModel}}</i>.${infoText2}</p>

<ul>
{{#classes}}{{#inThisSchema}}
<li id="json-schema-overview-{{#humanLabel}}{{#translate}}{{sanitizeLink}}{{/translate}}{{/humanLabel}}">
  <a href="{{#pimClass}}#{{#humanLabel}}{{#translate}}conceptual-class-{{sanitizeLink}}{{/translate}}{{/humanLabel}}{{/pimClass}}">
    {{#humanLabel}}{{translate}}{{/humanLabel}}
  </a>
<ul>
{{#properties}}
<li>
    <code>{{technicalLabel}}</code>:
    {{#cardinalityIsRequired}}povinná{{/cardinalityIsRequired}}
    {{^cardinalityIsRequired}}nepovinná{{/cardinalityIsRequired}}
    ({{cardinalityRange}}) položka typu {{#dataTypes}}
      {{#isAssociation}}<strong><a href="#json-schema-overview-{{#dataType.humanLabel}}{{#translate}}{{sanitizeLink}}{{/translate}}{{/dataType.humanLabel}}">{{#dataType.humanLabel}}{{translate}}{{/dataType.humanLabel}}</a></strong>{{/isAssociation}}
      {{#isAttribute}} {{#dataType}}<a href="{{{.}}}">{{#.}}{{#getLabelForDataType}}{{translate}}{{/getLabelForDataType}}{{/.}}</a>{{#regex}} dle regulárního výrazu <code>{{{.}}}</code>{{/regex}}{{/dataType}}{{^dataType}}bez datového typu{{/dataType}}{{/isAttribute}}
    {{/dataTypes}}
</li>
{{/properties}}
</ul>
</li>
{{/inThisSchema}}{{/classes}}
</ul>

<h3>Detailní specifikace prvků JSON struktury</h3>

{{#classes}}{{#inThisSchema}}
<section id="{{#humanLabel}}{{#translate}}json-structure-class-{{sanitizeLink}}{{/translate}}{{/humanLabel}}">
<h4>Objekt <i>{{#humanLabel}}{{translate}}{{/humanLabel}}</i></h4>
<dl>
{{#humanDescription}}{{#translate}}
<dt>Popis</dt>
<dd>{{.}}</dd>
{{/translate}}{{/humanDescription}}
<dt>Interpretace</dt>
{{#pimClass}}
<dd>
  <a href="#{{#humanLabel}}{{#translate}}conceptual-class-{{sanitizeLink}}{{/translate}}{{/humanLabel}}">{{#humanLabel}}{{translate}}{{/humanLabel}}</a>
</dd>
{{/pimClass}}
</dl>

{{#properties}}
<section id="{{#humanLabel}}{{#translate}}json-structure-property-{{sanitizeLink}}{{/translate}}{{/humanLabel}}">
<h5>Vlastnost <code>{{technicalLabel}}</code></h5>
<dl>
<dt>Klíč</dt>
<dd>\`{{technicalLabel}}\`</dd
<dt>Jméno</dt>
<dd>{{#humanLabel}}{{translate}}{{/humanLabel}}</dd
{{#humanDescription}}{{#translate}}
<dt>Popis</dt>
<dd>{{.}}</dd
{{/translate}}{{/humanDescription}}
<dt>Povinnost</dt>
<dd>{{#cardinalityIsRequired}}povinné{{/cardinalityIsRequired}}{{^cardinalityIsRequired}}nepovinné{{/cardinalityIsRequired}}</dd
<dt>Kardinalita</dt>
<dd>{{cardinalityRange}}</dd
<dt>Typ</dt>
{{#dataTypes}}

{{#isAssociation}}
<dd>
  <a href="{{externalDocumentation}}#{{#dataType.humanLabel}}{{#translate}}json-structure-class-{{sanitizeLink}}{{/translate}}{{/dataType.humanLabel}}">{{#dataType.humanLabel}}{{translate}}{{/dataType.humanLabel}}</a>
</dd>
{{/isAssociation}}

{{#isAttribute}}
<dd>
{{#dataType}}<a href="{{{.}}}">{{#.}}{{#getLabelForDataType}}{{translate}}{{/getLabelForDataType}}{{/.}}</a>{{/dataType}}{{^dataType}}bez datového typu{{/dataType}}
</dd>
{{/isAttribute}}

{{/dataTypes}}

{{#dataTypes}}{{#isAttribute}}{{#example}}
<dt>Příklad</dt>
<dd><div>{{.}}</div></dd>
{{/example}}{{/isAttribute}}{{/dataTypes}}

<dt>Interpretace</dt>
{{#pimAssociation}} 
<dd>
<a href="#{{#humanLabel}}{{#translate}}conceptual-property-{{sanitizeLink}}{{/translate}}{{/humanLabel}}">{{#humanLabel}}{{translate}}{{/humanLabel}}</a>
</dd>
{{/pimAssociation}}
</dl>
</section>
{{/properties}}

</section>
{{/inThisSchema}}{{/classes}}
</section>`);
            }

            return render(`## Přehled JSON struktury
${infoText} {{#structureModel}}{{#roots}}{{#classes}}{{#humanLabel}}{{translate}}{{/humanLabel}}{{/classes}}{{/roots}}{{/structureModel}}.${infoText2}

{{#classes}}{{#inThisSchema}}
- [{{#humanLabel}}{{translate}}{{/humanLabel}}]({{#pimClass}}#{{#humanLabel}}{{#translate}}conceptual-class-{{sanitizeLink}}{{/translate}}{{/humanLabel}}{{/pimClass}})
{{#properties}}
    - \`{{technicalLabel}}\`: {{#cardinalityIsRequired}}povinná{{/cardinalityIsRequired}}{{^cardinalityIsRequired}}nepovinná{{/cardinalityIsRequired}} ({{cardinalityRange}}) položka typu {{#dataTypes}}{{#isAssociation}}**{{#dataType.humanLabel}}{{translate}}{{/dataType.humanLabel}}**{{/isAssociation}}{{#isAttribute}} {{#dataType}}[{{#.}}{{#getLabelForDataType}}{{translate}}{{/getLabelForDataType}}{{/.}}]({{{.}}}){{#regex}} dle regulárního výrazu \`{{{.}}}\`{{/regex}}{{/dataType}}{{^dataType}}bez datového typu{{/dataType}}{{/isAttribute}}{{/dataTypes}}
{{/properties}}
{{/inThisSchema}}{{/classes}}

## Detailní specifikace prvků JSON struktury
V této části jsou specifikovány jednotlivé prvky JSON struktury.

{{#classes}}{{#inThisSchema}}
### {{#humanLabel}}{{translate}}{{/humanLabel}} ### {#{{#humanLabel}}{{#translate}}json-structure-class-{{sanitizeLink}}{{/translate}}{{/humanLabel}}}
{{#humanDescription}}{{#translate}}
: Popis
:: {{.}}
{{/translate}}{{/humanDescription}}
: Interpretace
{{#pimClass}}:: [{{#humanLabel}}{{translate}}{{/humanLabel}}](#{{#humanLabel}}{{#translate}}conceptual-class-{{sanitizeLink}}{{/translate}}{{/humanLabel}}){{/pimClass}}
{{#properties}}
#### Vlastnost \`{{technicalLabel}}\` #### {#{{#humanLabel}}{{#translate}}json-structure-property-{{sanitizeLink}}{{/translate}}{{/humanLabel}}}
: Klíč
:: \`{{technicalLabel}}\`
: Jméno
:: {{#humanLabel}}{{translate}}{{/humanLabel}}
{{#humanDescription}}{{#translate}}
: Popis
:: {{.}}
{{/translate}}{{/humanDescription}}
: Povinnost
:: {{#cardinalityIsRequired}}povinné{{/cardinalityIsRequired}}{{^cardinalityIsRequired}}nepovinné{{/cardinalityIsRequired}}
: Kardinalita
:: {{cardinalityRange}}
: Typ
{{#dataTypes}}
{{#isAssociation}}:: [{{#dataType.humanLabel}}{{translate}}{{/dataType.humanLabel}}]({{externalDocumentation}}#{{#dataType.humanLabel}}{{#translate}}json-structure-class-{{sanitizeLink}}{{/translate}}{{/dataType.humanLabel}}){{/isAssociation}}{{#isAttribute}}:: {{#dataType}}[{{#.}}{{#getLabelForDataType}}{{translate}}{{/getLabelForDataType}}{{/.}}]({{{.}}}){{/dataType}}{{^dataType}}bez datového typu{{/dataType}}{{/isAttribute}}
{{/dataTypes}}
: Interpretace
{{#pimAssociation}}:: [{{#humanLabel}}{{translate}}{{/humanLabel}}](#{{#humanLabel}}{{#translate}}conceptual-property-{{sanitizeLink}}{{/translate}}{{/humanLabel}}){{/pimAssociation}}
{{/properties}}
{{/inThisSchema}}{{/classes}}
`);
          }
        },	
      };
    }
    return null;
  }
}
