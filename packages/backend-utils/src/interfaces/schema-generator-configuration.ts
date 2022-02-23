import {DataSpecification} from "@model-driven-data/core/data-specification/model/data-specification";

/**
 * Represents a configuration for schema-generator application that contains
 * all the information needed to work with specified data structure.
 */
export interface SchemaGeneratorConfiguration {
  /**
   * Iri of the data specification that contains the tree that will be edited
   */
  dataSpecification: string;

  /**
   * Iri of the PSM schema, that will be edited.
   */
  dataPsmSchemaIri: string;

  /**
   * List of data specifications that are needed to edit the PSM schema.
   */
  dataSpecifications: DataSpecification[];
}
