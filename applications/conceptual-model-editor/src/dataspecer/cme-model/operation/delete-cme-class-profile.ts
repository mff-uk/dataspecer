import { EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";
import { deleteEntity } from "@dataspecer/core-v2/semantic-model/operations";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { DataspecerError } from "../../dataspecer-error";

/**
 * @throws DataspecerError
 */
export function deleteCmeClassProfile(
  model: InMemorySemanticModel,
  value: {
    identifier: EntityDsIdentifier,
    model: ModelDsIdentifier,
  },
) {
  const operation = deleteEntity(value.identifier);

  const result = model.executeOperation(operation);
  if (result.success === false) {
    throw new DataspecerError("Operation execution failed.");
  }
}
