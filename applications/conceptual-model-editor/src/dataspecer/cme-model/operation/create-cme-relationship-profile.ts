import { createDefaultSemanticModelProfileOperationFactory } from "@dataspecer/core-v2/semantic-model/profile/operations";
import { NewCmeRelationshipProfile } from "../model/cme-relationship-profile";
import { CmeReference } from "../model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { DataspecerError } from "../../dataspecer-error";
import { CreatedEntityOperationResult } from "@dataspecer/core-v2/semantic-model/operations";

const factory = createDefaultSemanticModelProfileOperationFactory();

/**
 * @throws DataspecerError
 */
export function createCmeRelationshipProfile(
  model: InMemorySemanticModel,
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

  const result = model.executeOperation(operation);
  if (result.success === false) {
    throw new DataspecerError("Operation execution failed.");
  }
  return {
    identifier: (result as CreatedEntityOperationResult).id,
    model: model.getId(),
  };
}
