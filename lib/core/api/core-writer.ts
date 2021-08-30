import {CoreOperation, CoreOperationResult} from "../operation";

export interface CoreResourceWriter {

  /**
   * Apply given event and return IRIs of changed resources.
   */
  applyOperation(operation: CoreOperation): Promise<CoreOperationResult>;

}
