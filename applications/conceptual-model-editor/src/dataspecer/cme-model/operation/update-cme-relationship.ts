import { modifyRelation } from "@dataspecer/core-v2/semantic-model/operations";
import { CmeRelationshipProfile } from "../model";
import { DataspecerError } from "../../dataspecer-error";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";

/**
 * @throws DataspecerError
 */
export function updateCmeRelationship(
  model: InMemorySemanticModel,
  next: CmeRelationshipProfile,
) {
  const operation = modifyRelation(next.identifier, {
    ends: [{
      iri: null,
      name: {},
      description: {},
      concept: next.domain,
      cardinality: next.domainCardinality ?? undefined,
    }, {
      iri: next.iri,
      name: next.name ?? {},
      description: next.description ?? {},
      concept: next.range,
      cardinality: next.rangeCardinality ?? undefined,
    }]
  })

  const result = model.executeOperation(operation);
  if (result.success === false) {
    throw new DataspecerError("Operation execution failed.");
  }
}
