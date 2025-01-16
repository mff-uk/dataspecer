import {
  type SemanticModelRelationship,
  isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
  type SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import type { VisualModel } from "@dataspecer/core-v2/visual-model";

export type DomainAndRange<EndType> = {
    domain: EndType | null,
    domainIndex: number | null,
    range: EndType | null,
    rangeIndex: number | null
}

/**
 * For given relation returns domain and range.
 *
 * The domain and range are determined based on their value.
 * Only the range has iri set to non-null value.
 */
export const getDomainAndRange = <EndType extends { iri: string | null }>(
  relationship: { ends: EndType[] },
): DomainAndRange<EndType> => {
  const [first, second] = relationship.ends;

  // We use the end's iri to determine which one denotes the range.
  const firstIri = first?.iri ?? null;
  const secondIri = second?.iri ?? null;

  if (firstIri === null && secondIri === null) {
    return emptyDomainAndRange();
  }

  if (firstIri !== null) {
    return {
      domain: second,
      domainIndex: 1,
      range: first,
      rangeIndex: 0,
    };
  } else {
    return {
      domain: first,
      domainIndex: 0,
      range: second,
      rangeIndex: 1,
    };
  }
};

/**
 * @returns Representation of empty domain and range.
 */
function emptyDomainAndRange() {
  return {
    domain: null,
    domainIndex: null,
    range: null,
    rangeIndex: null,
  };
}

export type DomainAndRangeConcepts = {
    domain: string | null;
    range: string | null;
};

/**
 * Specialization of universal getDomainAndRange function to work with both
 * relationship as well as relationship profile.
 */
export const getDomainAndRangeConcepts = (
  relationship: SemanticModelRelationship | SemanticModelRelationshipUsage,
): DomainAndRangeConcepts => {
  if (isSemanticModelRelationship(relationship)) {
    const domainAndRange = getDomainAndRange(relationship);
    return {
      domain: domainAndRange.domain?.concept ?? null,
      range: domainAndRange.range?.concept ?? null,
    };
  } else {
    const domainAndRange = getDomainAndRange(relationship);
    return {
      domain: domainAndRange.domain?.concept ?? null,
      range: domainAndRange.range?.concept ?? null,
    };
  }
};

/**
 * For given cardinality return human readable representation.
 */
export const cardinalityToHumanLabel = (cardinality: [number, number | null] | undefined | null): string | null => {
  if (cardinality === null || cardinality === undefined) {
    return null;
  }
  return `[${cardinality[0] ?? "*"}..${cardinality[1] ?? "*"}]`;
};

/**
 * Checks whether a relationship(profile) has only one end with an iri
 * @param entity
 * @returns `truthy` if both ends of `entity` have an `iri`, `false` otherwise
 */
export const bothEndsHaveAnIri = (entity: SemanticModelRelationship | SemanticModelRelationshipUsage) => {
  if (isSemanticModelRelationship(entity)) {
    const [first, second] = entity.ends;
    return first?.iri && first.iri.length > 0 && second?.iri && second.iri.length > 0;
  } else {
    return false;
  }
};

/**
 * Return true, when both ends of a relationship are on the canvas.
 */
export const hasBothEndsInVisualModel = (
  entity: SemanticModelRelationship | SemanticModelRelationshipUsage,
  visualModel: VisualModel | null,
) => {
  if (visualModel === null) {
    return false;
  }

  let domainConcept = "";
  let rangeConcept = "";
  if (isSemanticModelRelationship(entity)) {
    const domainAndRange = getDomainAndRange(entity);
    domainConcept = domainAndRange.domain?.concept ?? "";
    rangeConcept = domainAndRange.range?.concept ?? "";
  } else {
    const domainAndRange = getDomainAndRange(entity);
    domainConcept = domainAndRange.domain?.concept ?? "";
    rangeConcept = domainAndRange.range?.concept ?? "";
  }

  const domainOnCanvas = visualModel.getVisualEntityForRepresented(domainConcept);
  const rangeOnCanvas = visualModel.getVisualEntityForRepresented(rangeConcept);
  return domainOnCanvas !== null && rangeOnCanvas !== null;
};
