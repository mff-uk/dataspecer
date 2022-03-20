import {DataSpecification} from "@model-driven-data/core/data-specification/model/data-specification";
import {PlantUmlImageGenerator} from "../src/artifacts/plant-uml-image-generator";
import {BIKESHED} from "@model-driven-data/core/bikeshed";
import {BikeshedHtmlGenerator} from "../src/artifacts/bikeshed-html-generator";
import {DataSpecificationDocumentation} from "@model-driven-data/core/data-specification/model";
import {PlantUmlGenerator} from "@model-driven-data/core/plant-uml";
import {DataSpecificationSchema} from "@model-driven-data/core/data-specification/model/data-specification-schema";
import {JSON_SCHEMA} from "@model-driven-data/core/json-schema/json-schema-vocabulary";
import {XML_SCHEMA} from "@model-driven-data/core/xml-schema/xml-schema-vocabulary";
import {CoreResourceReader} from "@model-driven-data/core/core";
import {DataSpecificationArtefact} from "@model-driven-data/core/data-specification/model/data-specification-artefact";
import {GeneratorOptions} from "./generator-options";
import {getNameForDataPsmSchema, getNameForPimSchema} from "./get-human-name";
import {CSV_SCHEMA} from "@model-driven-data/core/csv-schema/csv-schema-vocabulary";

function filenameSafeString(str: string): string {
    return str
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .toLowerCase();
}

function nameFromIri(iri: string): string {
    return iri.split("/").pop() as string;
}

/**
 * This class is responsible for setting the artifacts definitions in
 * {@link DataSpecification}. This class should be highly configurable, allowing
 * to set various parameters for how the resulting generated object should look
 * like.
 */
export class ArtifactDefinitionConfigurator {
  private readonly dataSpecifications: DataSpecification[];
  private readonly store: CoreResourceReader;

  constructor(
    dataSpecifications: DataSpecification[],
    store: CoreResourceReader,
  ) {
    this.dataSpecifications = dataSpecifications;
    this.store = store;
  }

  /**
   * Sets {@link DataSpecification.artefacts} field for the given specification.
   * @param dataSpecificationIri Iri of the specification to set the artifacts for.
   * @param generatorOptions Defines which artifacts should be generated.
   */
  public async setConfigurationForSpecification(
    dataSpecificationIri: string,
    generatorOptions: GeneratorOptions,
  ): Promise<void> {
    const dataSpecification = this.dataSpecifications.find(
      dataSpecification => dataSpecification.iri === dataSpecificationIri,
    );

    if (dataSpecification === undefined) {
      throw new Error(`Data specification with IRI ${dataSpecificationIri} not found.`);
    }

    // todo names are not unique
    let dataSpecificationName = await getNameForPimSchema(this.store, dataSpecification.pim as string, ["cs"]);
    if (dataSpecificationName === undefined) {
      dataSpecificationName = nameFromIri(dataSpecification.pim as string);
    }
    dataSpecificationName = filenameSafeString(dataSpecificationName);

    // Generate schemas

    const currentSchemaArtefacts: DataSpecificationArtefact[] = [];
    for (const psmSchemaIri of dataSpecification.psms) {
      // todo names are not unique
      let name = await getNameForDataPsmSchema(this.store, psmSchemaIri, ["cs"]);
      if (name === undefined) {
        name = nameFromIri(psmSchemaIri);
      }
      name = filenameSafeString(name);

      if (generatorOptions.requiredDataStructureSchemas[psmSchemaIri]?.includes("json")) {
        const jsonSchema = new DataSpecificationSchema();
        jsonSchema.iri = `${name}#jsonschema`;
        jsonSchema.outputPath = `${dataSpecificationName}/${name}/schema.json`;
        jsonSchema.publicUrl = jsonSchema.outputPath;
        jsonSchema.generator = JSON_SCHEMA.Generator;
        jsonSchema.psm = psmSchemaIri;

        currentSchemaArtefacts.push(jsonSchema);
      }

      if (generatorOptions.requiredDataStructureSchemas[psmSchemaIri]?.includes("xml")) {
        const xmlSchema = new DataSpecificationSchema();
        xmlSchema.iri = `${name}#xmlschema`;
        xmlSchema.outputPath = `${dataSpecificationName}/${name}/schema.xsd`;
        xmlSchema.publicUrl = xmlSchema.outputPath;
        xmlSchema.generator = XML_SCHEMA.Generator;
        xmlSchema.psm = psmSchemaIri;

        currentSchemaArtefacts.push(xmlSchema);
      }

      if (generatorOptions.requiredDataStructureSchemas[psmSchemaIri]?.includes("csv")) {
        const csvSchema = new DataSpecificationSchema();
        csvSchema.iri = `${name}#csvschema`;
        csvSchema.outputPath = `${dataSpecificationName}/${name}/schema.csv-metadata.json`;
        csvSchema.publicUrl = csvSchema.outputPath;
        csvSchema.generator = CSV_SCHEMA.Generator;
        csvSchema.psm = psmSchemaIri;
        currentSchemaArtefacts.push(csvSchema);
      }
    }

    // PlantUML source
    const plantUml = new DataSpecificationDocumentation();
    plantUml.outputPath = `${dataSpecificationName}/conceptual-model.plantuml`;
    plantUml.publicUrl = plantUml.outputPath;
    plantUml.generator = PlantUmlGenerator.IDENTIFIER;

    // PlantUml image
    const plantUmlImage = new DataSpecificationDocumentation();
    plantUmlImage.outputPath = `${dataSpecificationName}/conceptual-model.png`;
    plantUmlImage.publicUrl = plantUmlImage.outputPath;
    plantUmlImage.generator = PlantUmlImageGenerator.IDENTIFIER;

    // Bikeshed source
    const bikeshed = new DataSpecificationDocumentation();
    bikeshed.outputPath = `${dataSpecificationName}/documentation.bs`;
    bikeshed.publicUrl = bikeshed.outputPath;
    bikeshed.generator = BIKESHED.Generator;
    bikeshed.artefacts =
      currentSchemaArtefacts.map(artefact => artefact.iri as string);

    // Bikeshed HTML
    const bikeshedHtml = new DataSpecificationDocumentation();
    bikeshedHtml.outputPath = `${dataSpecificationName}/documentation.html`;
    bikeshedHtml.publicUrl = bikeshedHtml.outputPath;
    bikeshedHtml.generator = BikeshedHtmlGenerator.IDENTIFIER;
    bikeshedHtml.artefacts =
      currentSchemaArtefacts.map(artefact => artefact.iri as string);

    // Override the value
    dataSpecification.artefacts = [
      ...currentSchemaArtefacts,
      plantUml,
      plantUmlImage,
      bikeshed,
      bikeshedHtml,
    ];
  }
}
