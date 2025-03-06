import { modifyRelation } from "@dataspecer/core-v2/semantic-model/operations";
import { CmeRelationshipProfile } from "../model";
import { CmeOperationExecutor } from "./cme-operation-executor";

/**
 * @throws DataspecerError
 */
export function updateCmeRelationship(
  executor: CmeOperationExecutor,
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

  executor.executeOperation(next.model, operation);
}
