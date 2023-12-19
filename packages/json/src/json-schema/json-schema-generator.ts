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

    return {structureModel, jsonSchema, mergedConceptualModel}
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
    } else if (documentationIdentifier === "https://schemas.dataspecer.com/generator/openapi") {
      const {structureModel, jsonSchema, mergedConceptualModel} = await this.generateToObject(context, artefact, specification, true);
      const conceptualModelProperties: Record<string, ConceptualModelProperty> = {};
      Object.values(mergedConceptualModel.classes).forEach(cls => {
        cls.properties.forEach(prop => {
          conceptualModelProperties[prop.pimIri] = prop;
        });
      });
      structureModel.getClasses().forEach(cls => {
        cls.pimClass = mergedConceptualModel.classes[cls.pimIri];
        cls.inThisSchema = !((cls.structureSchema !== structureModel.psmIri) || cls.isReferenced);
        cls.properties.forEach(prop => {
          prop.pimAssociation = conceptualModelProperties[prop.pimIri];
        });
      });
      console.log(structureModel);
      console.log(mergedConceptualModel);
      return {
        structureModel, jsonSchema,
        classes: await structureModel.getClasses(),
        useTemplate: () => (template, render) => {
          if (template.trim() !== "") {
            return render(template);
          } else {
            return render(`## JSON struktura
V této sekci je definován strukturní model pro [JSON schéma]({{#publicUrl}}{{{relativePath}}}{{/publicUrl}}).
{{specification}}
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
{{#isAssociation}}:: [{{#dataType.humanLabel}}{{translate}}{{/dataType.humanLabel}}](#{{#humanLabel}}{{#translate}}json-structure-class-{{sanitizeLink}}{{/translate}}{{/humanLabel}}){{/isAssociation}}{{#isAttribute}}:: {{#dataType}}[{{#.}}{{#getLabelForDataType}}{{translate}}{{/getLabelForDataType}}{{/.}}]({{{.}}}){{/dataType}}{{^dataType}}bez datového typu{{/dataType}}{{/isAttribute}}
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
