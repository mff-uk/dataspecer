import { SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { CmeRelationship } from "../model";

export const semanticRelationshipToCmeRelationship = (
  semanticModel: string,
  entity: SemanticModelRelationship,
): CmeRelationship => {
  const [domain, range] = selectDomainAndRange(entity.ends);
  return {
    model: semanticModel,
    identifier: entity.id,
    iri: range.iri,
    name: range.name,
    description: range.description,
    externalDocumentationUrl: range.externalDocumentationUrl ?? null,
    domain: domain.concept,
    domainCardinality: domain.cardinality ?? null,
    range: range.concept,
    rangeCardinality: range.cardinality ?? null,
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
