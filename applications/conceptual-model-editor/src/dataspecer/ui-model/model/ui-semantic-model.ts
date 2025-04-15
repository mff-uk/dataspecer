import { ModelDsIdentifier } from "../../entity-model";
import { UiModelType } from "./ui-model-type";

export interface UiSemanticModel {

  identifier: ModelDsIdentifier;

  /**
   * Type of underlying model representation.
   */
  modelType: UiModelType;

  /**
   * Short label representing the entity in the user interface.
   */
  displayLabel: string;

  displayColor: string;

}
