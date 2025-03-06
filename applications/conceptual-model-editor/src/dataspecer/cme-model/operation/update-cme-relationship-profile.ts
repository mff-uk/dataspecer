import { createDefaultSemanticModelProfileOperationFactory } from "@dataspecer/core-v2/semantic-model/profile/operations";
import { CmeRelationshipProfile } from "../model/cme-relationship-profile";
import { CmeOperationExecutor } from "./cme-operation-executor";

const factory = createDefaultSemanticModelProfileOperationFactory();

/**
 * @throws DataspecerError
 */
export function updateCmeRelationshipProfile(
  executor: CmeOperationExecutor,
  next: CmeRelationshipProfile,
) {
  const operation = factory.modifyRelationshipProfile(next.identifier,{
    ends: [{
      profiling: [],
      iri: null,
      name: null,
      nameFromProfiled: null,
      description: null,
      descriptionFromProfiled: null,
      usageNote: null,
      usageNoteFromProfiled: null,
      concept: next.domain,
      cardinality: next.domainCardinality,
    }, {
      profiling: next.profileOf,
      iri: next.iri,
      name: next.name,
      nameFromProfiled: next.nameSource,
      description: next.description,
      descriptionFromProfiled: next.descriptionSource,
      usageNote: next.usageNote,
      usageNoteFromProfiled: next.usageNoteSource,
      concept: next.range,
      cardinality: next.rangeCardinality,
    }]
  })

  executor.executeOperation(next.model, operation);
}
