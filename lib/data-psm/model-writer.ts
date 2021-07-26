import {CoreAction} from "../action/core-action";

export interface CoreModelWriter {

  /**
   * Apply given event and return IRIs of changed resources.
   */
  updateModel(action: CoreAction): Promise<string[]>

}
