import { EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";
import { deleteEntity } from "@dataspecer/core-v2/semantic-model/operations";
import { CmeOperationExecutor } from "./cme-operation-executor";

/**
 * @throws DataspecerError
 */
export function deleteCmeGeneralization(
  executor: CmeOperationExecutor,
  value: {
    identifier: EntityDsIdentifier,
    model: ModelDsIdentifier,
  },
) {
  const operation = deleteEntity(value.identifier);
  executor.executeCreateOperation(value.model, operation);
}
