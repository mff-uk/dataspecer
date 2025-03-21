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
import { assertFailed, assertNot, createStringSelector } from "@dataspecer/core/core";
import {
  structureModelAddDefaultValues,
  transformStructureModel
} from "@dataspecer/core/structure-model/transformation";
import { JSON_SCHEMA } from "./json-schema-vocabulary";
import { structureModelAddIdAndTypeProperties } from "./json-id-transformations";
import {DefaultJsonConfiguration, JsonConfiguration, JsonConfigurator} from "../configuration";
import {structureModelAddJsonProperties} from "../json-structure-model/add-json-properties";
import {DataSpecificationConfigurator, DefaultDataSpecificationConfiguration, DataSpecificationConfiguration} from "@dataspecer/core/data-specification/configuration";
import { StructureModel, StructureModelClass, StructureModelProperty } from "@dataspecer/core/structure-model/model";
import { ConceptualModel, ConceptualModelProperty } from "@dataspecer/core/conceptual-model";
import { pathRelative } from "@dataspecer/core/core/utilities/path-relative";
import { MAIN_JSON_PARTIAL } from "../documentation/configuration";

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
    const jsonSchema = structureModelToJsonSchema(
      context.specifications,
      specification,
      structureModel,
      configuration,
      artefact,
      createStringSelector([configuration.jsonLabelLanguage])
    );

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
    if (documentationIdentifier === "https://schemas.dataspecer.com/generator/template-artifact") {
      const {artifact: documentationArtefact, partial} = callerContext as {
        artifact: DataSpecificationArtefact,
        partial: (template: string) => string,
      };

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
        cls.isSimpleClass = cls.properties.length === 0;
        // @ts-ignore
        cls.inThisSchema = (cls.structureSchema === structureModel.psmIri);
        // @ts-ignore
        cls.isFromExternalSchema = cls.structureSchema !== structureModel.psmIri && cls.isReferenced;
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

      return {
        structureModel,
        jsonSchema,
        configuration,
        classes: structureModel.getClasses().filter(cls => cls.properties.length !== 0),
        structureModelLinkId: function() {
          function normalizeLabel(label: string) {
            return label.replace(/ /g, "-").toLowerCase();
          }

          if (this instanceof StructureModelClass) {
              const label = this.humanLabel?.cs ?? this.humanLabel?.en ?? "";
              return `json-schéma-objekt-${normalizeLabel(label)}`;
          } else if (this instanceof StructureModelProperty) {
            const obj = structureModel.getClasses().find(c => c.properties.find(p => p.psmIri === this.psmIri))!;
            const objLabel = obj.humanLabel?.cs ?? obj.humanLabel?.en ?? "";
            //const label = this.humanLabel?.cs ?? this.humanLabel?.en ?? "";
            return `json-schéma-vlastnost-${normalizeLabel(objLabel)}-${normalizeLabel(this.technicalLabel)}`;
          }
        },
        /**
         * Creates a link to a documentation for a given PSM schema.
         */
        classSpecificationArtifact: function() {
          const artefact = context.specifications[this.specification].artefacts.find(a => a.generator === "https://schemas.dataspecer.com/generator/template-artifact");
          return {
            link: pathRelative(documentationArtefact.publicUrl, artefact.publicUrl),
            semanticModel: context.conceptualModels[context.specifications[this.specification].pim],
          };
        },
        infoText,
        infoText2,
        // The partial wont throw an error if the partial is not defined
        useTemplate: partial(`{{#> ${MAIN_JSON_PARTIAL}}}{{/${MAIN_JSON_PARTIAL}}}`),
      };
    }
    return null;
  }
}
