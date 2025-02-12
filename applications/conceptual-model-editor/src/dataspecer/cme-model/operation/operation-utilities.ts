import { EntityModel } from "@dataspecer/core-v2";
import { ModelDsIdentifier } from "../../entity-model";
import { MissingModel } from "../../../application/error";
import { createLogger } from "../../../application";

const LOG = createLogger(import.meta.url);

/**
 * Find and return model with given identifier.
 *
 * @throws {@link MissingModel}
 */
export function findModel<ModelType extends EntityModel>(
  identifier: ModelDsIdentifier,
  models: ModelType[],
) {
  const result = models.find(model => model.getId() === identifier);
  if (result === undefined) {
    LOG.error("Missing model.", {identifier, models});
    throw new MissingModel(identifier);
  }
  return result;
}
