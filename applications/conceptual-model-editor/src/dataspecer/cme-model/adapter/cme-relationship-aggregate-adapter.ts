import { SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { CmeRelationshipAggregate } from "../model/cme-relationship-aggregate";
import { asMandatoryLevel, selectDomainAndRange } from "./adapter-utilities";

export const semanticRelationshipProfileToCmeRelationshipAggregate = (
  semanticModel: string,
  entity: SemanticModelRelationshipProfile,
  aggregate: SemanticModelRelationshipProfile,
): CmeRelationshipAggregate => {
  const [_, range] = selectDomainAndRange(entity.ends);
  const [aggregateDomain, aggregateRange] = selectDomainAndRange(aggregate.ends);
  return {
    aggregate: true,
    model: semanticModel,
    identifier: entity.id,
    iri: range.iri,
    name: aggregateRange.name ?? {},
    nameSource: range.nameFromProfiled,
    description: aggregateRange.description ?? {},
    descriptionSource: range.descriptionFromProfiled,
    externalDocumentationUrl: range.externalDocumentationUrl ?? null,
    domain: aggregateDomain.concept,
    domainCardinality: aggregateDomain.cardinality ?? null,
    range: aggregateRange.concept,
    rangeCardinality: aggregateRange.cardinality ?? null,
    profileOf: range.profiling,
    usageNote: aggregateRange.usageNote,
    usageNoteSource: aggregateRange.usageNoteFromProfiled,
    // We use ?? [] as this may not be always there.
    mandatoryLevel: asMandatoryLevel(range.tags ?? []),
  };
};
