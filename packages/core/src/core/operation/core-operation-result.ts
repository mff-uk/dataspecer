import { CoreOperation } from "./core-operation";
import { CoreTyped } from "../core-resource";

/**
 * Base class for operation results as should be returned by CoreResourceWriter.
 * Operations may specialize this class to provide more detailed data, yet
 * it is highly recommended to also handle this base version.
 */
export class CoreOperationResult extends CoreTyped {
  private static readonly OPERATION_YPE = "core-operation";

  /**
   * Operation as stored in the model, specifically with added IRI.
   */
  operation: CoreOperation | null = null;

  /**
   * IRIS of all resources created by the operation.
   */
  created: string[] = [];

  /**
   * IRIs of all resources changed by the operation.
   */
  changed: string[] = [];

  /**
   * IRIs of all resource deleted by the operation.
   */
  deleted: string[] = [];

  public constructor() {
    super();
    this.types.push(CoreOperationResult.OPERATION_YPE);
  }

  static is(resource: CoreTyped): resource is CoreOperationResult {
    return resource.types.includes(CoreOperationResult.OPERATION_YPE);
  }
}
