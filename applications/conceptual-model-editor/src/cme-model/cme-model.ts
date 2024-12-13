import { LanguageString } from "@dataspecer/core/core/core-resource";

/**
 * Represents na ability to be displayed in the user interface.
 */
export interface CmeDisplayable {

  displayLabel: LanguageString;

  displayDescription: LanguageString | null;

}

export enum CmeModelType {
  Default,
  InMemorySemanticModel,
  ExternalSemanticModel,
}

export type ModelDsIdentifier = string;

/**
 * Specialized representation for Dataspecer EntityModels.
 */
export interface CmeModel extends CmeDisplayable {

  /**
   * Dataspecer identifier.
   */
  dsIdentifier: ModelDsIdentifier;

  /**
   * Type of underlying model representation.
   */
  dsModelType: CmeModelType;

  /**
   * Display color can be retrieved from the visual model.
   * If color is not available default color is used instead.
   * As a result, this value is always defined.
   */
  displayColor: string;

  /**
   * Common IRI prefix for all entities in the model.
   */
  baseIri: string | null;

}
