import { CreatedEntityOperationResult, Operation } from "@dataspecer/core-v2/semantic-model/operations";
import { ModelDsIdentifier } from "../../entity-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { MissingModel } from "../../../application/error";
import { DataspecerError } from "../../dataspecer-error";
import { CmeReference } from "../model";

export interface CmeOperationExecutor {

  /**
   * Execute given operation.
   *
   * @param modelIdentifier
   * @param operation
   * @throws DataspecerError
   */
  executeOperation(
    modelIdentifier: ModelDsIdentifier,
    operation: Operation,
  ): void;

  /**
   * Same as {@link executeOperation}, just return the identifier
   * of the new entity. If you do not need the identifier use
   * {@link executeOperation} instead.
   *
   * @param modelIdentifier
   * @param operation
   * @returns Identifier of the created entity.
   * @throws DataspecerError
   */
  executeCreateOperation(
    modelIdentifier: ModelDsIdentifier,
    operation: Operation
  ): CmeReference;

}

class EagerCmeOperationExecutor implements CmeOperationExecutor {

  private readonly models: InMemorySemanticModel[];

  constructor(models: InMemorySemanticModel[]) {
    this.models = models;
  }

  executeOperation(
    modelIdentifier: ModelDsIdentifier,
    operation: Operation
  ): void {
    const model = this.findModel(modelIdentifier);
    const result = model.executeOperation(operation);
    if (result.success === false) {
      throw new DataspecerError("Operation execution failed.");
    }
  }

  /**
   * @returns Model with given identifier.
   * @throws {MissingModel}
   */
  findModel(identifier: ModelDsIdentifier) {
    const result = this.models.find(model => model.getId() === identifier);
    if (result === undefined) {
      throw new MissingModel(identifier);
    }
    return result;
  }

  executeCreateOperation(
    modelIdentifier: ModelDsIdentifier,
    operation: Operation
  ): CmeReference {
    const model = this.findModel(modelIdentifier);
    const result = model.executeOperation(operation);
    if (result.success === false) {
      throw new DataspecerError("Operation execution failed.");
    }
    return {
      identifier: (result as CreatedEntityOperationResult).id,
      model: modelIdentifier,
    };
  }

}

export function createEagerCmeOperationExecutor(
  models: InMemorySemanticModel[]) {
  return new EagerCmeOperationExecutor(models);
}
