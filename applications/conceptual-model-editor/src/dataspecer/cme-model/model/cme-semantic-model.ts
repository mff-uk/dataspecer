import { LanguageString, ModelDsIdentifier } from "../../entity-model";

export enum CmeSemanticModelType {

  /**
   * Default read only model.
   */
  DefaultSemanticModel = "default",

  /**
   * Writable model.
   */
  InMemorySemanticModel = "in-memory",

  /**
   * Read only model.
   */
  ExternalSemanticModel = "external",
}

export interface CmeSemanticModel {

  /**
   * Dataspecer identifier.
   */
  identifier: ModelDsIdentifier;

  /**
   * Type of underlying model representation.
   */
  modelType: CmeSemanticModelType;

  name: LanguageString;

  /**
   * Display color can be retrieved from the visual model.
   * If a color is not available default color is used instead.
   * As a result, this value is always defined.
   */
  color: string;

  /**
   * Common IRI prefix for all entities in the model.
   */
  baseIri: string | null;

}
