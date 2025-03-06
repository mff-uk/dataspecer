import { createDefaultSemanticModelProfileOperationFactory } from "@dataspecer/core-v2/semantic-model/profile/operations";
import { NewCmeClassProfile } from "../model/cme-class-profile";
import { CmeOperationExecutor } from "./cme-operation-executor";
import { CmeReference } from "../model";

const factory = createDefaultSemanticModelProfileOperationFactory();

/**
 * @throws DataspecerError
 */
export function createCmeClassProfile(
  executor: CmeOperationExecutor,
  value: NewCmeClassProfile,
): CmeReference {
  const operation = factory.createClassProfile({
    iri: value.iri,
    profiling: value.profileOf,
    name: value.name,
    nameFromProfiled: value.nameSource,
    description: value.description,
    descriptionFromProfiled: value.descriptionSource,
    usageNote: value.usageNote,
    usageNoteFromProfiled: value.usageNoteSource,
  });
  return executor.executeCreateOperation(value.model, operation);
}
