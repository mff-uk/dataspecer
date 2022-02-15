import { CoreOperation } from "../operation";
import { CoreResourceReader } from "../core-reader";
import { CoreExecutorResult } from "./core-executor-result";

/**
 * Given a CoreOperation check if operation is of given sub-type.
 */
export type CoreOperationTypeCheck<T extends CoreOperation> = (
  operation: CoreOperation
) => operation is T;

/**
 * Execute particular operation sub-type.
 */
export type CoreOperationSpecificExecutor<T extends CoreOperation> = (
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: T
) => Promise<CoreExecutorResult>;

/**
 * Given resource type return new unique IRI.
 */
export type CreateNewIdentifier = (resourceType: string) => string;

/**
 * Wrap for operation specific executors. The aim is to allow for
 * function-based implementation while provide type safety and
 * package all operation execution relevant information together.
 */
export class CoreOperationExecutor<T extends CoreOperation> {
  readonly typeChek: CoreOperationTypeCheck<T>;

  readonly executor: CoreOperationSpecificExecutor<T>;

  readonly type: string;

  constructor(
    typeChek: CoreOperationTypeCheck<T>,
    executor: CoreOperationSpecificExecutor<T>,
    type: string
  ) {
    this.typeChek = typeChek;
    this.executor = executor;
    this.type = type;
  }

  static create<T extends CoreOperation>(
    check: CoreOperationTypeCheck<T>,
    executor: CoreOperationSpecificExecutor<T>,
    type: string
  ): CoreOperationExecutor<T> {
    return new CoreOperationExecutor<T>(check, executor, type);
  }

  /**
   * Type agnostic operation execution function.
   */
  async execute(
    reader: CoreResourceReader,
    createNewIdentifier: CreateNewIdentifier,
    operation: CoreOperation
  ): Promise<CoreExecutorResult> {
    if (!this.typeChek(operation)) {
      return CoreExecutorResult.createError("Invalid operation type.");
    }
    return await this.executor(reader, createNewIdentifier, operation);
  }
}
