import {DataSpecification, DataSpecificationArtefact} from "@dataspecer/core/data-specification/model";
import {CoreResourceReader} from "@dataspecer/core/core";
import {PimSchema} from "@dataspecer/core/pim/model";
import {DataPsmSchema} from "@dataspecer/core/data-psm/model";
import {Configurator} from "@dataspecer/core/configuration/configurator";
import {mergeConfigurations} from "@dataspecer/core/configuration/utils";
import {getSchemaArtifacts} from "./schema-artifacts";

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
    store: CoreResourceReader,
    configurationObject: object,
    configurators: Configurator[],
  ) {
    this.dataSpecifications = dataSpecifications;
    this.store = store;
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

    // Generate schemas

    const currentSchemaArtefacts: DataSpecificationArtefact[] = [];
    for (const psmSchemaIri of dataSpecification.psms) {
      const name = await this.getSchemaDirectoryName(dataSpecificationIri, psmSchemaIri);

      currentSchemaArtefacts.push(...getSchemaArtifacts(
          psmSchemaIri,
          this.baseURL,
          `${dataSpecificationName}/${name}`,
          configuration
      ));
    }

    return currentSchemaArtefacts;
  }

  protected nameFromIri(iri: string): string {
    return iri.split("/").pop() as string;
  }

  protected normalizeName(name: string): string {
    return name
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
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
