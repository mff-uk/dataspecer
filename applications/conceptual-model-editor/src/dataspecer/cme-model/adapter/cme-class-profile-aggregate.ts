import { SemanticModelClassProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { CmeClassAggregate } from "../model/cme-class-aggregate";
import { asRole } from "./adapter-utilities";

export const semanticClassProfileToCmeClassAggregate = (
  semanticModel: string,
  entity: SemanticModelClassProfile,
  aggregate: SemanticModelClassProfile,
): CmeClassAggregate => {
  return {
    aggregate: true,
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
