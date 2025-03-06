import { CmeClass } from "../model";
import { modifyClass } from "@dataspecer/core-v2/semantic-model/operations";
import { CmeOperationExecutor } from "./cme-operation-executor";

/**
 * @throws DataspecerError
 */
export function updateCmeClass(
  executor: CmeOperationExecutor,
  next: CmeClass,
) {
  const operation = modifyClass(
    next.identifier, {
      iri: next.iri,
      name: next.name ?? undefined,
      description: next.description ?? undefined,
    });

  executor.executeOperation(next.model, operation);
}
