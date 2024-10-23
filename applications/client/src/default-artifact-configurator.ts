import { Configurator } from "@dataspecer/core/configuration/configurator";
import { mergeConfigurations } from "@dataspecer/core/configuration/utils";
import { CoreResourceReader } from "@dataspecer/core/core";
import { DataPsmSchema } from "@dataspecer/core/data-psm/model";
import { DataSpecificationConfigurator } from "@dataspecer/core/data-specification/configuration";
import { DataSpecification, DataSpecificationArtefact } from "@dataspecer/core/data-specification/model";
import { PimSchema } from "@dataspecer/core/pim/model";
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { getSchemaArtifacts } from "./schema-artifacts";

/**
 * This class is responsible for setting the artifacts definitions in
 * {@link DataSpecification}. This class should be highly configurable, allowing
 * to set various parameters for how the resulting generated object should look
 * like.
 */
export class DefaultArtifactConfigurator {
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
    store: FederatedObservableStore,
    configurationObject: object,
    configurators: Configurator[],
  ) {
    this.dataSpecifications = dataSpecifications;
    this.store = store as CoreResourceReader;
    this.configurationObject = configurationObject;
    this.configurators = configurators;
  }

  /**
   * Sets {@link DataSpecification.artefacts} field for the given specification.
   * @param dataSpecificationIri Iri of the specification to set the artifacts for.
   */
  public async generateFor(
    dataSpecificationIri: string,
  ): Promise<DataSpecificationArtefact[]> {
    const dataSpecification = this.dataSpecifications.find(
      dataSpecification => dataSpecification.iri === dataSpecificationIri,
    );

    if (dataSpecification === undefined) {
      throw new Error(`Data specification with IRI ${dataSpecificationIri} not found.`);
    }

    const localConfiguration = dataSpecification.artefactConfiguration;
    const configuration = mergeConfigurations(this.configurators, this.configurationObject, localConfiguration);

    const dataSpecificationName = await this.getSpecificationDirectoryName(dataSpecificationIri);

    const dataSpecificationConfiguration = DataSpecificationConfigurator.getFromObject(configuration);
    const baseFromConfig = dataSpecificationConfiguration.publicBaseUrl ? dataSpecificationConfiguration.publicBaseUrl : null;
    this.baseURL = baseFromConfig ?? `/${dataSpecificationName}`;
    if (this.baseURL.endsWith("/")) {
      this.baseURL = this.baseURL.slice(0, -1);
    }

    // Generate schemas
    if (dataSpecification.type === DataSpecification.TYPE_EXTERNAL) {
      // @ts-ignore
      return configuration.artifacts ?? [];
    } else if (dataSpecification.type === DataSpecification.TYPE_DOCUMENTATION) {
      const currentSchemaArtefacts: DataSpecificationArtefact[] = [];
      for (const psmSchemaIri of dataSpecification.psms) {
        let subdirectory = "/" + await this.getSchemaDirectoryName(dataSpecificationIri, psmSchemaIri);

        if (dataSpecificationConfiguration.skipStructureNameIfOnlyOne && dataSpecification.psms.length === 1) {
          subdirectory = "";
        }

        currentSchemaArtefacts.push(...getSchemaArtifacts(
            psmSchemaIri,
            `${this.baseURL}${subdirectory}`,
            `${dataSpecificationName}${subdirectory}`,
            configuration
        ));
      }

      return currentSchemaArtefacts;
    }
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
        dataSpecification => dataSpecification.iri === dataSpecificationIri,
    ) as DataSpecification;

    const schema = await this.store.readResource(dataSpecification.pim as string) as PimSchema;

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

  protected async getSchemaDirectoryName(dataSpecificationIri: string, dataPsmSchemaIri: string) {
    const psmSchema = await this.store.readResource(dataPsmSchemaIri) as DataPsmSchema;

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
