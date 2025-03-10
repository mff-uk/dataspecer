import { CreatedEntityOperationResult, createGeneralization } from "@dataspecer/core-v2/semantic-model/operations";
import { NewCmeGeneralization } from "../model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { DataspecerError } from "../../dataspecer-error";

export function createCmeGeneralization(
  model: InMemorySemanticModel,
  value: NewCmeGeneralization,
) {
  const operation = createGeneralization({
    iri: value.iri,
    child: value.childIdentifier,
    parent: value.parentIdentifier,
  });

  const result = model.executeOperation(operation);
  if (result.success === false) {
    throw new DataspecerError("Operation execution failed.");
  }
  return {
    identifier: (result as CreatedEntityOperationResult).id,
    model: model.getId(),
  };
}
