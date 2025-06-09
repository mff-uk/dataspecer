import {
  createDefaultSemanticModelProfileOperationFactory,
} from "@dataspecer/core-v2/semantic-model/profile/operations";
import { CmeClassProfile } from "../model/cme-class-profile";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { DataspecerError } from "../../dataspecer-error";
import { CmeReference } from "../model";

const factory = createDefaultSemanticModelProfileOperationFactory();

/**
 * Change values of only the given properties.
 *
 * @throws DataspecerError
 */
export function changeCmeClassProfile(
  model: InMemorySemanticModel,
  next: CmeReference & Partial<CmeClassProfile>,
) {

  // We just pass through the changes.
  const operation = factory.modifyClassProfile(
    next.identifier, {
      ...next,
    });

  const result = model.executeOperation(operation);
  if (result.success === false) {
    throw new DataspecerError("Operation execution failed.");
  }
}
