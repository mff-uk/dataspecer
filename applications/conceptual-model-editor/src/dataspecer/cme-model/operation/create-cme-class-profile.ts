import { EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createDefaultSemanticModelProfileOperationFactory } from "@dataspecer/core-v2/semantic-model/profile/operations";
import { CreatedEntityOperationResult } from "@dataspecer/core-v2/semantic-model/operations";
import { DataspecerError } from "../../dataspecer-error";
import { NewCmeClassProfile } from "../model/cme-class-profile";
import { findModel } from "./operation-utilities";

const factory = createDefaultSemanticModelProfileOperationFactory();

/**
 * @throws DataspecerError
 */
export function createCmeClassProfile(
  profile: NewCmeClassProfile,
  models: InMemorySemanticModel[],
): {
  identifier: EntityDsIdentifier,
  model: ModelDsIdentifier,
} {
  const model = findModel(profile.model, models);

  const operation = factory.createClassProfile({
    iri: profile.iri,
    profiling: profile.profileOf,
    name: profile.name,
    nameFromProfiled: profile.nameSource,
    description: profile.description,
    descriptionFromProfiled: profile.descriptionSource,
    usageNote: profile.usageNote,
    usageNoteFromProfiled: profile.usageNoteSource,
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
