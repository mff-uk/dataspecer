import { createClass } from "@dataspecer/core-v2/semantic-model/operations";
import { CmeReference, NewCmeClass } from "../model";
import { CmeOperationExecutor } from "./cme-operation-executor";

/**
 * @throws DataspecerError
 */
export function createCmeClass(
  executor: CmeOperationExecutor,
  value: NewCmeClass,
): CmeReference {
  const operation = createClass({
    iri: value.iri,
    name: value.name ?? undefined,
    description: value.description ?? undefined,
  });

  return executor.executeCreateOperation(value.model, operation);
}
