import {CoreOperation} from "../operation";

export interface ModelChange {

  /**
   * Operation as stored in the model, specifically with added IRI.
   */
  operation: CoreOperation;

  /**
   * IRIs of all resources changed by the operation.
   */
  changed: string[];

  /**
   * IRIs of all resource deleted by the operation.
   */
  deleted: string[];

}

export interface CoreModelWriter {

  /**
   * Apply given event and return IRIs of changed resources.
   */
  applyOperation(operation: CoreOperation): Promise<ModelChange>;

}
