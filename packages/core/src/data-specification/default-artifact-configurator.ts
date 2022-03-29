import {DataSpecification} from "./model";
import {DataSpecificationSchema} from "./model";
import {JSON_SCHEMA} from "../json-schema/json-schema-vocabulary";
import {XML_SCHEMA} from "../xml-schema/xml-schema-vocabulary";
import {XSLT_LIFTING, XSLT_LOWERING} from "../xml-transformations/xslt-vocabulary";
import {CSV_SCHEMA} from "../csv-schema/csv-schema-vocabulary";
import {CoreResourceReader} from "../core";
import {DataSpecificationArtefact} from "./model";
import {PimSchema} from "../pim/model";
import {DataPsmSchema} from "../data-psm/model";

/**
 * This class is responsible for setting the artifacts definitions in
 * {@link DataSpecification}. This class should be highly configurable, allowing
 * to set various parameters for how the resulting generated object should look
 * like.
 */
export class DefaultArtifactConfigurator {
  protected readonly dataSpecifications: DataSpecification[];
  protected readonly store: CoreResourceReader;

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

    const dataSpecificationName = await this.getSpecificationDirectoryName(dataSpecificationIri);

    // Generate schemas

    const currentSchemaArtefacts: DataSpecificationArtefact[] = [];
    for (const psmSchemaIri of dataSpecification.psms) {
      const name = await this.getSchemaDirectoryName(dataSpecificationIri, psmSchemaIri);

      const jsonSchema = new DataSpecificationSchema();
      jsonSchema.iri = `${name}#jsonschema`;
      jsonSchema.outputPath = `${dataSpecificationName}/${name}/schema.json`;
      jsonSchema.publicUrl = jsonSchema.outputPath;
      jsonSchema.generator = JSON_SCHEMA.Generator;
      jsonSchema.psm = psmSchemaIri;
      currentSchemaArtefacts.push(jsonSchema);

      const xmlSchema = new DataSpecificationSchema();
      xmlSchema.iri = `${name}#xmlschema`;
      xmlSchema.outputPath = `${dataSpecificationName}/${name}/schema.xsd`;
      xmlSchema.publicUrl = xmlSchema.outputPath;
      xmlSchema.generator = XML_SCHEMA.Generator;
      xmlSchema.psm = psmSchemaIri;
      currentSchemaArtefacts.push(xmlSchema);

      const xsltLifting = new DataSpecificationSchema();
      xsltLifting.iri = `${name}#xsltlifting`;
      xsltLifting.outputPath = `${dataSpecificationName}/${name}/lifting.xslt`;
      xsltLifting.publicUrl = xsltLifting.outputPath;
      xsltLifting.generator = XSLT_LIFTING.Generator;
      xsltLifting.psm = psmSchemaIri;
      currentSchemaArtefacts.push(xsltLifting);

      const xsltLowering = new DataSpecificationSchema();
      xsltLowering.iri = `${name}#xsltlowering`;
      xsltLowering.outputPath = `${dataSpecificationName}/${name}/lowering.xslt`;
      xsltLowering.publicUrl = xsltLowering.outputPath;
      xsltLowering.generator = XSLT_LOWERING.Generator;
      xsltLowering.psm = psmSchemaIri;
      currentSchemaArtefacts.push(xsltLowering);

      const csvSchema = new DataSpecificationSchema();
      csvSchema.iri = `${name}#csvschema`;
      csvSchema.outputPath = `${dataSpecificationName}/${name}/schema.csv-metadata.json`;
      csvSchema.publicUrl = csvSchema.outputPath;
      csvSchema.generator = CSV_SCHEMA.Generator;
      csvSchema.psm = psmSchemaIri;
      currentSchemaArtefacts.push(csvSchema);
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
