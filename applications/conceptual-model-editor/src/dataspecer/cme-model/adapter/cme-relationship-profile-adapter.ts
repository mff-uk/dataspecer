import { CmeRelationshipProfile, CmeRelationshipProfileMandatoryLevel } from "../model";
import { SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";

export const semanticRelationshipProfileToCmeRelationshipProfile = (
  semanticModel: string,
  entity: SemanticModelRelationshipProfile,
  aggregate: SemanticModelRelationshipProfile,
): CmeRelationshipProfile => {
  const [_, range] = selectDomainAndRange(entity.ends);
  const [aggregateDomain, aggregateRange] = selectDomainAndRange(aggregate.ends);

  return {
    model: semanticModel,
    identifier: entity.id,
    iri: aggregateRange.iri,
    name: aggregateRange.name ?? {},
    nameSource: range.nameFromProfiled,
    description: aggregateRange.description ?? {},
    descriptionSource: range.descriptionFromProfiled,
    externalDocumentationUrl: aggregateRange.externalDocumentationUrl ?? null,
    domain: aggregateDomain.concept,
    domainCardinality: aggregateDomain.cardinality ?? null,
    range: aggregateRange.concept,
    rangeCardinality: aggregateRange.cardinality ?? null,
    profileOf: range.profiling,
    usageNote: aggregateRange.usageNote,
    usageNoteSource: range.usageNoteFromProfiled,
    // We use ?? [] as this may not be always there.
    mandatoryLevel: asMandatoryLevel(range.tags ?? []),
  };
};

/**
 * The range is the one with the IRI, or just the second one.
 */
const selectDomainAndRange = <T extends { iri: string | null }>(
  ends: T[],
): T[] => {
  const [first, second] = ends;
  if (isDefined(first?.iri)) {
    return [second, first];
  } else if (isDefined(second?.iri)) {
    return [first, second];
  } else {
    return [first, second];
  }
};

const isDefined = <T>(value: T | null | undefined) => {
  return value !== undefined && value !== null;
};

const asMandatoryLevel = (
  tags: string[],
): CmeRelationshipProfileMandatoryLevel | null => {
  if (tags.includes(CmeRelationshipProfileMandatoryLevel.Mandatory)) {
    return CmeRelationshipProfileMandatoryLevel.Mandatory;
  }
  if (tags.includes(CmeRelationshipProfileMandatoryLevel.Recommended)) {
    return CmeRelationshipProfileMandatoryLevel.Recommended;
  }
  if (tags.includes(CmeRelationshipProfileMandatoryLevel.Optional)) {
    return CmeRelationshipProfileMandatoryLevel.Optional;
  }
  return null;
}
