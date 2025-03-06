import { createGeneralization } from "@dataspecer/core-v2/semantic-model/operations";
import { NewCmeGeneralization } from "../model";
import { CmeOperationExecutor } from "./cme-operation-executor";

/**
 * @throws DataspecerError
 */
export function createCmeGeneralization(
  executor: CmeOperationExecutor,
  value: NewCmeGeneralization,
) {
  const operation = createGeneralization({
    iri: value.iri,
    child: value.childIdentifier,
    parent: value.parentIdentifier,
  });

  executor.executeOperation(value.model, operation);
}
