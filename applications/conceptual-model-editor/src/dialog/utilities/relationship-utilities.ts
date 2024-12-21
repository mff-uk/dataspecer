import { Cardinality, EntityRepresentative, representCardinalities, representCardinality, representUndefinedCardinality } from "./dialog-utilities";

export interface RelationshipState<RangeType> {

  /**
   * Domain.
   */
  domain: EntityRepresentative;

  /**
   * Domain cardinality.
   */
  domainCardinality: Cardinality;

  /**
   * Available domain items.
   */
  availableDomainItems: EntityRepresentative[];

  /**
   * Range.
   */
  range: RangeType;

  /**
   * Range cardinality.
   */
  rangeCardinality: Cardinality;

  /**
   * Available range items.
   */
  availableRangeItems: RangeType[];

  /**
   * Cardinalities that can be set.
   */
  availableCardinalities: Cardinality[];

}

export function createRelationshipStateForNew<RangeType extends { identifier: string }>(
  defaultDomain: EntityRepresentative,
  domains: EntityRepresentative[],
  defaultRange: RangeType,
  ranges: RangeType[],
): RelationshipState<RangeType> {
  const cardinalities = [
    representUndefinedCardinality(),
    ...representCardinalities()
  ];

  return {
    domain: defaultDomain,
    domainCardinality: representUndefinedCardinality(),
    availableDomainItems: domains,
    range: defaultRange,
    rangeCardinality: representUndefinedCardinality(),
    availableRangeItems: ranges,
    availableCardinalities: cardinalities,
  };
}

export function createRelationshipStateForEdit<RangeType extends { identifier: string }>(
  domain: string | null,
  defaultDomain: EntityRepresentative,
  domainCardinality: [number, number | null] | undefined | null,
  domains: EntityRepresentative[],
  range: string | null,
  defaultRange: RangeType,
  rangeCardinality: [number, number | null] | undefined | null,
  ranges: RangeType[],
): RelationshipState<RangeType> {

  const cardinalities = [
    representUndefinedCardinality(),
    ...representCardinalities()
  ];

  return {
    domain: domains.find(item => item.identifier === domain) ?? defaultDomain,
    domainCardinality: representCardinality(domainCardinality),
    availableDomainItems: domains,
    range: ranges.find(item => item.identifier === range) ?? defaultRange,
    rangeCardinality: representCardinality(rangeCardinality),
    availableRangeItems: ranges,
    availableCardinalities: cardinalities,
  };
}

export interface RelationshipController<RangeType> {

  setDomain: (value: EntityRepresentative) => void;

  setDomainCardinality: (value: Cardinality) => void;

  setRange: (value: RangeType) => void;

  setRangeCardinality: (value: Cardinality) => void;

}

export function createRelationshipController<RangeType, State extends RelationshipState<RangeType>>(
  changeState: (next: State | ((prevState: State) => State)) => void,
): RelationshipController<RangeType> {

  const setDomain = (value: EntityRepresentative) => {
    changeState((state) => ({ ...state, domain: value }));
  };

  const setDomainCardinality = (value: Cardinality) => {
    changeState((state) => ({ ...state, domainCardinality: value }));
  };

  const setRange = (value: RangeType) => {
    changeState((state) => ({ ...state, range: value }));
  };

  const setRangeCardinality = (value: Cardinality) => {
    changeState((state) => ({ ...state, rangeCardinality: value }));
  };

  return {
    setDomain,
    setDomainCardinality,
    setRange,
    setRangeCardinality,
  };
}
