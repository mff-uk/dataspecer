import { CmeGeneralization } from "../model";
import { modifyGeneralization } from "@dataspecer/core-v2/semantic-model/operations";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { DataspecerError } from "../../dataspecer-error";

/**
 * @throws DataspecerError
 */
export function updateCmeGeneralization(
  model: InMemorySemanticModel,
  next: CmeGeneralization,
) {
  const operation = modifyGeneralization(
    next.identifier, {
      iri: next.iri,
      child: next.childIdentifier,
      parent: next.parentIdentifier,
    });

  const result = model.executeOperation(operation);
  if (result.success === false) {
    throw new DataspecerError("Operation execution failed.");
  }
}
