import { Configurator } from "@dataspecer/core/configuration/configurator";
import { mergeConfigurations } from "@dataspecer/core/configuration/utils";
import { CoreResourceReader } from "@dataspecer/core/core";
import { DataPsmSchema } from "@dataspecer/core/data-psm/model";
import { DataSpecificationConfigurator } from "@dataspecer/core/data-specification/configuration";
import {
  DataSpecification,
  DataSpecificationArtefact,
  DataSpecificationSchema
} from "@dataspecer/core/data-specification/model";
import { PimSchema } from "@dataspecer/core/pim/model";
import { JSON_SCHEMA } from "@dataspecer/json/json-schema";
import { LDkitGenerator } from "@dataspecer/ldkit";

export class ArtifactConfigurator {
  protected readonly dataSpecifications: DataSpecification[];
  protected readonly store: CoreResourceReader;
  protected configurationObject: object;
  protected configurators: Configurator[];

  /**
   * Root URL for the generated artifacts.
   * @example
   * "/"
   * @example
   * "http://example.com/files/"
   */
  baseURL = "/";

  constructor(
    dataSpecifications: DataSpecification[],
    store: CoreResourceReader,
    configurationObject: object,
    configurators: Configurator[]
  ) {
    this.dataSpecifications = dataSpecifications;
    this.store = store;
    this.configurationObject = configurationObject;
    this.configurators = configurators;
  }

  public async generateFor(
    dataSpecificationIri: string
  ): Promise<DataSpecificationArtefact[]> {
    const artifacts = [] as DataSpecificationArtefact[];

    const dataSpecification = this.dataSpecifications.find(
      (dataSpecification) => dataSpecification.iri === dataSpecificationIri
    );

    if (dataSpecification === undefined) {
      throw new Error(
        `Data specification with IRI ${dataSpecificationIri} not found.`
      );
    }

    const localConfiguration = dataSpecification.artefactConfiguration;
    const configuration = mergeConfigurations(
      this.configurators,
      this.configurationObject,
      localConfiguration
    );

    const dataSpecificationName = await this.getSpecificationDirectoryName(
      dataSpecificationIri
    );

    const dataSpecificationConfiguration =
      DataSpecificationConfigurator.getFromObject(configuration);
    // const generatorsEnabledByDefault =
    //   dataSpecificationConfiguration.generatorsEnabledByDefault!;

    //if ((dataSpecificationConfiguration.useGenerators?.["LDkit"] ?? generatorsEnabledByDefault) === true) {
    const ldkitArtifact: DataSpecificationArtefact = new DataSpecificationArtefact();
    ldkitArtifact.iri = `${dataSpecificationIri}#LDkit`;
    ldkitArtifact.generator = LDkitGenerator.IDENTIFIER;
    const ldkitArtifactFileName = dataSpecificationConfiguration.renameArtifacts?.[ldkitArtifact.generator] ?? "LDkit/";
    ldkitArtifact.outputPath = `${dataSpecificationName}/${ldkitArtifactFileName}`;
    ldkitArtifact.publicUrl = `${this.baseURL}/${ldkitArtifactFileName}`;
    //artifact.configuration = configuration;
    artifacts.push(ldkitArtifact);
    //}

    for (const psmSchemaIri of dataSpecification.psms) {
      let subdirectory = "/" + await this.getSchemaDirectoryName(dataSpecificationIri, psmSchemaIri);

      if (dataSpecificationConfiguration.skipStructureNameIfOnlyOne && dataSpecification.psms.length === 1) {
        subdirectory = "";
      }

      artifacts.push(...getSchemaArtifacts(
          psmSchemaIri,
          `${this.baseURL}${subdirectory}`,
          `${dataSpecificationName}${subdirectory}`,
          configuration
      ));
    }

    return artifacts;
  }

  protected nameFromIri(iri: string): string {
    return iri.split("/").pop() as string;
  }

  protected normalizeName(name: string): string {
    return name
      .replace(/[\s/<>:"\\|?*]+/g, "-") // Windows and Linux forbidden characters
      .toLowerCase();
  }

  /**
   * Creates a directory name for data specification
   * @param dataSpecificationIri
   * @protected
   */
  protected async getSpecificationDirectoryName(dataSpecificationIri: string) {
    const dataSpecification = this.dataSpecifications.find(
      (dataSpecification) => dataSpecification.iri === dataSpecificationIri
    ) as DataSpecification;

    const schema = (await this.store.readResource(
      dataSpecification.pim as string
    )) as PimSchema;

    if (schema && schema.pimHumanLabel) {
      if (schema.pimHumanLabel["en"]) {
        return this.normalizeName(schema.pimHumanLabel["en"]);
      }
      // Get any value from object
      const anyValue = Object.values(schema.pimHumanLabel)?.[0];
      if (anyValue) {
        return this.normalizeName(anyValue);
      }
    }

    return this.nameFromIri(dataSpecificationIri);
  }

  protected async getSchemaDirectoryName(
    dataSpecificationIri: string,
    dataPsmSchemaIri: string
  ) {
    const psmSchema = (await this.store.readResource(
      dataPsmSchemaIri
    )) as DataPsmSchema;

    if (psmSchema && psmSchema.dataPsmHumanLabel) {
      if (psmSchema.dataPsmHumanLabel["en"]) {
        return this.normalizeName(psmSchema.dataPsmHumanLabel["en"]);
      }
      // Get any value from object
      const anyValue = Object.values(psmSchema.dataPsmHumanLabel)?.[0];
      if (anyValue) {
        return this.normalizeName(anyValue);
      }
    }

    return this.nameFromIri(dataSpecificationIri);
  }
}

export function getSchemaArtifacts(
  psmSchemaIri: string,
  baseUrl: string,
  basePath: string,
  configuration: object
) {
  const dataSpecificationConfiguration = DataSpecificationConfigurator.getFromObject(configuration);
  const generatorsEnabledByDefault = dataSpecificationConfiguration.generatorsEnabledByDefault!;

  const artifacts: DataSpecificationArtefact[] = [];

  const jsonSchema = new DataSpecificationSchema();
  jsonSchema.iri = `${psmSchemaIri}#jsonschema`;
  jsonSchema.generator = JSON_SCHEMA.Generator;
  const jsonSchemaFileName = dataSpecificationConfiguration.renameArtifacts?.[jsonSchema.generator] ?? "schema.json";
  jsonSchema.outputPath = `${basePath}/${jsonSchemaFileName}`;
  jsonSchema.publicUrl = `${baseUrl}/${jsonSchemaFileName}`;
  jsonSchema.psm = psmSchemaIri;
  jsonSchema.configuration = configuration;
  if ((dataSpecificationConfiguration.useGenerators?.["json"] ?? generatorsEnabledByDefault) !== false) {
      artifacts.push(jsonSchema);
  }

  return artifacts;
}
