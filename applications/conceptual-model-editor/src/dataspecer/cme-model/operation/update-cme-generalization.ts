import { CmeGeneralization } from "../model";
import { modifyGeneralization } from "@dataspecer/core-v2/semantic-model/operations";
import { CmeOperationExecutor } from "./cme-operation-executor";

/**
 * @throws DataspecerError
 */
export function updateCmeGeneralization(
  executor: CmeOperationExecutor,
  next: CmeGeneralization,
) {
  const operation = modifyGeneralization(
    next.identifier, {
      iri: next.iri,
      child: next.childIdentifier,
      parent: next.parentIdentifier,
    });

  executor.executeOperation(next.model, operation);
}
