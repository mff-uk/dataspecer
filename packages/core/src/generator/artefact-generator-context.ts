import {
  DataSpecification,
  DataSpecificationSchema
} from "../data-specification/model";
import {ConceptualModel} from "../conceptual-model";
import {StructureModel} from "../structure-model";
import {CoreResourceReader} from "../core";
import type {ArtefactGenerator} from "./artefact-generator";

export interface StructureClassSchemaLocation {

  specification: DataSpecification;

  artefact: DataSpecificationSchema;

}

export interface ArtefactGeneratorContext {

  /**
   * Federated reader for all the data.
   */
  readonly reader: CoreResourceReader;

  /**
   * Conceptual models as loaded based on the specifications.
   */
  readonly conceptualModels: { [iri: string]: ConceptualModel };

  /**
   * Structural models as loaded based on the specifications.
   */
  readonly structureModels: { [iri: string]: StructureModel };

  /**
   * Includes re-used specifications.
   */
  readonly specifications: { [iri: string]: DataSpecification };

  /**
   * @param iri IRI of a generator.
   * @param type Type of content the generator should generate.
   */
  createGenerator(iri: string, type: string): Promise<ArtefactGenerator | null>;

  // /**
  //  * Return location of a given structure class in a schema artefact definition.
  //  */
  // findStructureClassSchemaLocation(iri: string)
  //   : StructureClassSchemaLocation | null;

}
