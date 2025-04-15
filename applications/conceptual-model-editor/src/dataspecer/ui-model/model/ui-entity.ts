import { EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";

export interface UiEntity {

  type: string;

  model: ModelDsIdentifier;

  identifier: EntityDsIdentifier;

  /**
   * Short label representing the entity in the user interface.
   */
  displayLabel: string;

}
