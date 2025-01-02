import { LanguageString } from "@dataspecer/core/core/core-resource";

import { ModelDsIdentifier } from "../entity-model";

export enum CmeModelType {
  Default,
  InMemorySemanticModel,
  ExternalSemanticModel,
}

export interface CmeModel {

  /**
   * Dataspecer identifier.
   */
  dsIdentifier: ModelDsIdentifier;

  /**
   * Type of underlying model representation.
   */
  dsModelType: CmeModelType;

  displayLabel: LanguageString;

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
