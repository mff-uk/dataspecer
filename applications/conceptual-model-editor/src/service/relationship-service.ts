import {
  type SemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";

import {
  type SemanticModelRelationshipUsage,
  type SemanticModelRelationshipEndUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";

import {
  type SemanticModelRelationshipEnd
} from "@dataspecer/core-v2/semantic-model/concepts";

type RelationshipEnd = SemanticModelRelationshipEnd | SemanticModelRelationshipEndUsage | null;

type DomainAndRange = {
  domain: RelationshipEnd,
  domainIndex: number | null,
  range: RelationshipEnd,
  rangeIndex: number | null
}

export const getRange = (relationship: SemanticModelRelationship | SemanticModelRelationshipUsage): RelationshipEnd => {
  return getDomainAndRange(relationship)?.range || null;
};

export const getDomainAndRange = (relationship: SemanticModelRelationship | SemanticModelRelationshipUsage): DomainAndRange => {
  const [first, second] = relationship.ends;

  const bothEndsAreUndefined = first === undefined || second === undefined;
  if (bothEndsAreUndefined) {
    return emptyDomainAndRange();
  }

  // When both IRIs are given we can not decide.
  const bothEndsHaveIri = first.iri !== null && second.iri !== null;
  if (bothEndsHaveIri) {
    return emptyDomainAndRange();
  }

  // Only the first one has an IRI.
  if (first.iri !== null) {
    return {
      domain: second,
      domainIndex: 1,
      range: first,
      rangeIndex: 0,
    };
  }

  // Only the second one has an IRI.
  if (second.iri !== null) {
    return {
      domain: first,
      domainIndex: 0,
      range: second,
      rangeIndex: 1,
    };
  }

  // Default.
  return emptyDomainAndRange();
};

function emptyDomainAndRange() {
  return {
    domain: null,
    domainIndex: null,
    range: null,
    rangeIndex: null,
  };
}

export const cardinalityToString = (cardinality: [number, number | null] | undefined | null): string | null => {
  if (cardinality === null || cardinality === undefined) {
    return null;
  }
  return `[${cardinality[0] ?? "*"}..${cardinality[1] ?? "*"}]`;
};
