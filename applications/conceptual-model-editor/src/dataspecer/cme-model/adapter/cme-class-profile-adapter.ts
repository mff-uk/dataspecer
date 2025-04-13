import { SemanticModelClassProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { CmeClassProfile, CmeClassProfileRole } from "../model";

export const semanticClassProfileToCmeClassProfile = (
  semanticModel: string,
  entity: SemanticModelClassProfile,
  aggregate: SemanticModelClassProfile,
): CmeClassProfile => {
  return {
    model: semanticModel,
    identifier: entity.id,
    iri: entity.iri,
    name: aggregate.name,
    nameSource: entity.nameFromProfiled,
    description: aggregate.description,
    descriptionSource: entity.descriptionFromProfiled,
    externalDocumentationUrl: entity.externalDocumentationUrl ?? null,
    profileOf: entity.profiling,
    usageNote: aggregate.usageNote,
    usageNoteSource: entity.usageNoteFromProfiled,
    // We use ?? [] as this may not be always there.
    role: asRole(entity.tags ?? []),
  };
};

const asRole = (tags: string[]) : CmeClassProfileRole | null => {
  if (tags.includes(CmeClassProfileRole.Main)) {
    return CmeClassProfileRole.Main;
  }
  if (tags.includes(CmeClassProfileRole.Supportive)) {
    return CmeClassProfileRole.Supportive;
  }
  return null;
};
