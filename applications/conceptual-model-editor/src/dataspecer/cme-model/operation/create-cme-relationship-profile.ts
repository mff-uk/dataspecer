import { createDefaultSemanticModelProfileOperationFactory } from "@dataspecer/core-v2/semantic-model/profile/operations";
import { NewCmeRelationshipProfile } from "../model/cme-relationship-profile";
import { CmeOperationExecutor } from "./cme-operation-executor";
import { CmeReference } from "../model";

const factory = createDefaultSemanticModelProfileOperationFactory();

/**
 * @throws DataspecerError
 */
export function createCmeRelationshipProfile(
  executor: CmeOperationExecutor,
  value: NewCmeRelationshipProfile,
): CmeReference {
  const operation = factory.createRelationshipProfile({
    ends: [{
      profiling: [],
      iri: null,
      name: null,
      nameFromProfiled: null,
      description: null,
      descriptionFromProfiled: null,
      usageNote: null,
      usageNoteFromProfiled: null,
      concept: value.domain,
      cardinality: value.domainCardinality,
    }, {
      profiling: value.profileOf,
      iri: value.iri,
      name: value.name,
      nameFromProfiled: value.nameSource,
      description: value.description,
      descriptionFromProfiled: value.descriptionSource,
      usageNote: value.usageNote,
      usageNoteFromProfiled: value.usageNoteSource,
      concept: value.range,
      cardinality: value.rangeCardinality,
    }]
  })

  return executor.executeCreateOperation(value.model, operation);
}
