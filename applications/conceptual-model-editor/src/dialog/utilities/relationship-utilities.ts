import { MissingEntity, RuntimeError } from "../../application/error";
import { EntityDsIdentifier } from "../../dataspecer/entity-model";
import { Cardinality, EntityRepresentative, representCardinalities, representCardinality, UNDEFINED_IDENTIFIER } from "./dialog-utilities";

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
  availableDomains: EntityRepresentative[];

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
  availableRanges: RangeType[];

  /**
   * Cardinalities that can be set.
   */
  availableCardinalities: Cardinality[];

}

export function createRelationshipStateForNew<RangeType extends { identifier: string }>(
  domain: EntityRepresentative,
  availableDomains: EntityRepresentative[],
  range: RangeType,
  availableRanges: RangeType[],
): RelationshipState<RangeType> {

  return {
    domain,
    domainCardinality: representCardinality(null),
    availableDomains,
    range: range,
    rangeCardinality: representCardinality(null),
    availableRanges,
    availableCardinalities: representCardinalities(),
  };
}

export function createRelationshipStateForEdit<RangeType extends { identifier: string }>(
  domain: string | null,
  domainCardinality: [number, number | null] | undefined | null,
  availableDomains: EntityRepresentative[],
  range: string | null,
  rangeCardinality: [number, number | null] | undefined | null,
  availableRanges: RangeType[],
): RelationshipState<RangeType> {

  const effectiveDomain = domain ?? UNDEFINED_IDENTIFIER;
  const domainRepresentative = availableDomains.find(item => item.identifier === effectiveDomain);
  if (domainRepresentative === undefined) {
    throw new RuntimeError("Missing representation for domain.");
  }

  const effectiveRange = range ?? UNDEFINED_IDENTIFIER;
  const rangeRepresentative = availableRanges.find(item => item.identifier === effectiveRange);
  if (rangeRepresentative === undefined) {
    throw new RuntimeError("Missing representation for range.");
  }

  return {
    domain: domainRepresentative,
    domainCardinality: representCardinality(domainCardinality),
    availableDomains: availableDomains,
    range: rangeRepresentative,
    rangeCardinality: representCardinality(rangeCardinality),
    availableRanges: availableRanges,
    availableCardinalities: representCardinalities(),
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
