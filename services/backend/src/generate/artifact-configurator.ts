import { Configurator } from "@dataspecer/core/configuration/configurator";
import { mergeConfigurations } from "@dataspecer/core/configuration/utils";
import { CoreResourceReader } from "@dataspecer/core/core";
import { DataPsmSchema } from "@dataspecer/core/data-psm/model";
import { DataSpecificationConfigurator } from "@dataspecer/core/data-specification/configuration";
import {
  DataSpecification,
  DataSpecificationArtefact
} from "@dataspecer/core/data-specification/model";
import { PimSchema } from "@dataspecer/core/pim/model";

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
      const artifact: DataSpecificationArtefact = new DataSpecificationArtefact();
      artifact.iri = `${dataSpecificationIri}#LDkit`;
      artifact.generator = "https://schemas.dataspecer.com/generator/LDkit";
      const artifactFileName = dataSpecificationConfiguration.renameArtifacts?.[artifact.generator] ?? "LDkit/";
      artifact.outputPath = `${dataSpecificationName}/${artifactFileName}`;
      artifact.publicUrl = `${this.baseURL}/${artifactFileName}`;
      //artifact.configuration = configuration;
      artifacts.push(artifact);
    //}

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
