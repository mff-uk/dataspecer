import {CoreOperation} from "./core-operation";

/**
 * Base class for operation results as should be returned by CoreResourceWriter.
 * Operations may specialize this class to provide more detailed data, yet
 * it is highly recommended to also handle this base version.
 */
export interface CoreOperationResult {

  /**
   * Operation as stored in the model, specifically with added IRI.
   */
  operation: CoreOperation;

  /**
   * IRIS of all resources created by the operation.
   */
  created: string[];

  /**
   * IRIs of all resources changed by the operation.
   */
  changed: string[];

  /**
   * IRIs of all resource deleted by the operation.
   */
  deleted: string[];

}