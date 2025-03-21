import { LanguageString, ModelDsIdentifier } from "../../entity-model";

export enum CmeSemanticModelType {
  Default,
  InMemorySemanticModel,
  ExternalSemanticModel,
}

export interface CmeSemanticModel {

  /**
   * Dataspecer identifier.
   */
  dsIdentifier: ModelDsIdentifier;

  /**
   * Type of underlying model representation.
   */
  dsModelType: CmeSemanticModelType;

  displayLabel: LanguageString;

  /**
   * Display color can be retrieved from the visual model.
   * If a color is not available default color is used instead.
   * As a result, this value is always defined.
   */
  displayColor: string;

  /**
   * Common IRI prefix for all entities in the model.
   */
  baseIri: string | null;

}
