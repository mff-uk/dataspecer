import { Cardinality, EntityRepresentative, representCardinalities, representCardinality, representUndefinedCardinality } from "./dialog-utilities";
import { createRelationshipController, RelationshipController, RelationshipState } from "./relationship-utilities";
import { validationNoProblem, ValidationState } from "./validation-utilities";

export interface RelationshipProfileState<RangeType> extends RelationshipState<RangeType> {

  // Domain

  initialDomain: EntityRepresentative;

  overrideDomain: boolean;

  domainValidation: ValidationState;

  // Domain cardinality

  initialDomainCardinality: Cardinality;

  overrideDomainCardinality: boolean;

  domainCardinalityValidation: ValidationState;

  // Range

  initialRange: RangeType;

  overrideRange: boolean;

  rangeValidation: ValidationState;

  // Range cardinality

  initialRangeCardinality: Cardinality;

  overrideRangeCardinality: boolean;

  rangeCardinalityValidation: ValidationState;

}

export function createRelationshipProfileStateForNew<RangeType extends { identifier: string }>(
  domain: string | null,
  defaultDomain: EntityRepresentative,
  domainCardinality: [number, number | null] | undefined | null,
  domains: EntityRepresentative[],
  range: string | null,
  defaultRange: RangeType,
  rangeCardinality: [number, number | null] | undefined | null,
  ranges: RangeType[],
): RelationshipProfileState<RangeType> {
  const initialDomain = domains.find(item => item.identifier === domain) ?? defaultDomain;
  const initialRange = ranges.find(item => item.identifier === range) ?? defaultRange;
  const initialDomainCardinality = representCardinality(domainCardinality);
  const initialRangeCardinality = representCardinality(rangeCardinality);
  const cardinalities = [
    representUndefinedCardinality(),
    ...representCardinalities()
  ];

  return {
    domain: initialDomain,
    initialDomain,
    overrideDomain: false,
    domainValidation: validationNoProblem(),
    domainCardinality: initialDomainCardinality,
    initialDomainCardinality,
    overrideDomainCardinality: false,
    domainCardinalityValidation: validationNoProblem(),
    availableDomainItems: domains,
    range: initialRange,
    initialRange,
    overrideRange: false,
    rangeValidation: validationNoProblem(),
    rangeCardinality: initialRangeCardinality,
    initialRangeCardinality,
    overrideRangeCardinality: false,
    rangeCardinalityValidation: validationNoProblem(),
    availableRangeItems: ranges,
    availableCardinalities: cardinalities,
  };
}

export function createRelationshipProfileStateForEdit<RangeType extends { identifier: string }>(
  domain: string | null,
  aggregatedDomain: string | null,
  defaultDomain: EntityRepresentative,
  domainCardinality: [number, number | null] | undefined | null,
  aggregatedDomainCardinality: [number, number | null] | undefined | null,
  domains: EntityRepresentative[],
  range: string | null,
  aggregatedRange: string | null,
  defaultRange: RangeType,
  rangeCardinality: [number, number | null] | undefined | null,
  aggregatedRangeCardinality: [number, number | null] | undefined | null,
  ranges: RangeType[],
): RelationshipProfileState<RangeType> {
  const initialDomain = domains.find(item => item.identifier === aggregatedDomain) ?? defaultDomain;
  const initialRange = ranges.find(item => item.identifier === aggregatedRange) ?? defaultRange;
  const initialDomainCardinality = representCardinality(aggregatedDomainCardinality);
  const initialRangeCardinality = representCardinality(aggregatedRangeCardinality);
  const cardinalities = [
    representUndefinedCardinality(),
    ...representCardinalities()
  ];

  return {
    domain: initialDomain,
    initialDomain,
    overrideDomain: domain === null,
    domainValidation: validationNoProblem(),
    domainCardinality: initialDomainCardinality,
    initialDomainCardinality,
    overrideDomainCardinality: domainCardinality === null,
    domainCardinalityValidation: validationNoProblem(),
    availableDomainItems: domains,
    range: initialRange,
    initialRange,
    overrideRange: range === null,
    rangeValidation: validationNoProblem(),
    rangeCardinality: initialRangeCardinality,
    initialRangeCardinality,
    overrideRangeCardinality: rangeCardinality === null,
    rangeCardinalityValidation: validationNoProblem(),
    availableRangeItems: ranges,
    availableCardinalities: cardinalities,
  };
}

export interface RelationshipProfileStateController<RangeType> extends RelationshipController<RangeType> {

  toggleDomainOverride: () => void;

  toggleDomainCardinalityOverride: () => void;

  toggleRangeOverride: () => void;

  toggleRangeCardinalityOverride: () => void;

}

export function createRelationshipProfileController<RangeType, State extends RelationshipProfileState<RangeType>>(
  changeState: (next: State | ((prevState: State) => State)) => void,
): RelationshipProfileStateController<RangeType> {

  const relationshipController = createRelationshipController(changeState);

  const toggleDomainOverride = () => {
    changeState((state) => ({ ...state, overrideDomain: !state.overrideDomain }));
  };

  const toggleDomainCardinalityOverride = () => {
    changeState((state) => ({ ...state, overrideDomainCardinality: !state.overrideDomainCardinality }));
  };

  const toggleRangeOverride = () => {
    changeState((state) => ({ ...state, overrideRange: !state.overrideRange }));
  };

  const toggleRangeCardinalityOverride = () => {
    changeState((state) => ({ ...state, overrideRangeCardinality: !state.overrideRangeCardinality }));
  };

  return {
    ...relationshipController,
    toggleDomainOverride,
    toggleDomainCardinalityOverride,
    toggleRangeOverride,
    toggleRangeCardinalityOverride,
  };

}
