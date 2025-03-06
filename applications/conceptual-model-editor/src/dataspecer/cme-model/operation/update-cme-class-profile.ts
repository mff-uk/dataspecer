import { createDefaultSemanticModelProfileOperationFactory } from "@dataspecer/core-v2/semantic-model/profile/operations";
import { CmeClassProfile } from "../model/cme-class-profile";
import { CmeOperationExecutor } from "./cme-operation-executor";

const factory = createDefaultSemanticModelProfileOperationFactory();

/**
 * @throws DataspecerError
 */
export function updateCmeClassProfile(
  executor: CmeOperationExecutor,
  next: CmeClassProfile,
) {
  const operation = factory.modifyClassProfile(
    next.identifier, {
      iri: next.iri,
      profiling: next.profileOf,
      name: next.name,
      nameFromProfiled: next.nameSource,
      description: next.description,
      descriptionFromProfiled: next.descriptionSource,
      usageNote: next.usageNote,
      usageNoteFromProfiled: next.usageNoteSource,
    });

  executor.executeOperation(next.model, operation);
}
