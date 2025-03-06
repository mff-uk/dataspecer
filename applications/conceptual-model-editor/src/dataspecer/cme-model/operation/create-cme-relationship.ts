import { createRelationship } from "@dataspecer/core-v2/semantic-model/operations";
import { CmeReference, NewCmeRelationship } from "../model";
import { CmeOperationExecutor } from "./cme-operation-executor";

/**
 * @throws DataspecerError
 */
export function createCmeRelationship(
  executor: CmeOperationExecutor,
  value: NewCmeRelationship,
): CmeReference {
  const operation = createRelationship({
    ends: [{
      iri: null,
      name: {},
      description: {},
      concept: value.domain,
      cardinality: value.domainCardinality ?? undefined,
    }, {
      name: value.name,
      description: value.description,
      concept: value.range,
      cardinality: value.rangeCardinality ?? undefined,
      iri: value.iri,
    }]
  });

  return executor.executeCreateOperation(value.model, operation);
}
