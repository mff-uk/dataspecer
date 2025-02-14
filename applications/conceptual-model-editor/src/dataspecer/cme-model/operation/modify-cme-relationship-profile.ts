import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createDefaultSemanticModelProfileOperationFactory } from "@dataspecer/core-v2/semantic-model/profile/operations";
import { DataspecerError } from "../../dataspecer-error";
import { CmeRelationshipProfile } from "../model/cme-relationship-profile";
import { findModel } from "./operation-utilities";

const factory = createDefaultSemanticModelProfileOperationFactory();

/**
 * @throws DataspecerError
 */
export function modifyCmeRelationshipProfile(
  profile: CmeRelationshipProfile,
  models: InMemorySemanticModel[],
): void {
  const model = findModel(profile.model, models);
  const operation = factory.modifyRelationshipProfile(profile.identifier,{
    ends: [{
      profiling: [],
      iri: null,
      name: null,
      nameFromProfiled: null,
      description: null,
      descriptionFromProfiled: null,
      usageNote: null,
      usageNoteFromProfiled: null,
      concept: profile.domain,
      cardinality: profile.domainCardinality,
    }, {
      profiling: profile.profileOf,
      iri: profile.iri,
      name: profile.name,
      nameFromProfiled: profile.nameSource,
      description: profile.description,
      descriptionFromProfiled: profile.descriptionSource,
      usageNote: profile.usageNote,
      usageNoteFromProfiled: profile.usageNoteSource,
      concept: profile.range,
      cardinality: profile.rangeCardinality,
    }]
  })

  const result = model.executeOperation(operation);
  if (result.success === false) {
    throw new DataspecerError("Operation execution failed.");
  }
}
