import { EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createDefaultSemanticModelProfileOperationFactory } from "@dataspecer/core-v2/semantic-model/profile/operations";
import { CreatedEntityOperationResult } from "@dataspecer/core-v2/semantic-model/operations";
import { DataspecerError } from "../../dataspecer-error";
import { NewCmeRelationshipProfile } from "../model/cme-relationship-profile";
import { findModel } from "./operation-utilities";

const factory = createDefaultSemanticModelProfileOperationFactory();

/**
 * @throws DataspecerError
 */
export function createCmeRelationshipProfile(
  profile: NewCmeRelationshipProfile,
  models: InMemorySemanticModel[],
): {
  identifier: EntityDsIdentifier,
  model: ModelDsIdentifier,
} {
  const model = findModel(profile.model, models);

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
      concept: profile.domain,
      conceptFromProfiled: profile.domainSource,
      cardinality: profile.domainCardinality,
      cardinalityFromProfiled: profile.domainCardinalitySource,
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
      conceptFromProfiled: profile.rangeSource,
      cardinality: profile.rangeCardinality,
      cardinalityFromProfiled: profile.rangeCardinalitySource,
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
