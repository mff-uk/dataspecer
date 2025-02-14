import { createLogger } from "../../application";
import { RuntimeError } from "../../application/error";
import { EntityDsIdentifier } from "../../dataspecer/entity-model";
import { EntityRepresentative, listProfileCardinalities, representProfileCardinality } from "./dialog-utilities";
import { RelationshipController, RelationshipState, createRelationshipController } from "./relationship-utilities";
import { ValidationState, validationNoProblem } from "./validation-utilities";

const LOG = createLogger(import.meta.url);

export interface RelationshipProfileState<RangeType> extends RelationshipState<RangeType> {

  // Domain

  domainValidation: ValidationState;

  // Domain cardinality

  overrideDomainCardinality: boolean;

  domainCardinalityValidation: ValidationState;

  // Range

  rangeValidation: ValidationState;

  // Range cardinality

  overrideRangeCardinality: boolean;

  rangeCardinalityValidation: ValidationState;

}

/**
 * @param defaultDomain Used when given domain representative can not be found.
 * @param defaultRange Used when given range representative can not be found.
 */
export function createRelationshipProfileStateForNew<RangeType extends { identifier: string }>(
  domainIdentifier: EntityDsIdentifier,
  domainCardinality: [number, number | null] | null,
  availableDomains: EntityRepresentative[],
  defaultDomain: EntityRepresentative,
  rangeIdentifier: EntityDsIdentifier,
  rangeCardinality: [number, number | null] | null,
  availableRanges: RangeType[],
  defaultRange: RangeType,
): RelationshipProfileState<RangeType> {

  // Domain
  let domain = availableDomains.find(item => item.identifier === domainIdentifier);
  if (domain === undefined) {
    LOG.warn("Can not find domain representative.",
      { domain: rangeIdentifier, availableDomains });
    domain = defaultDomain;
  }

  // Range
  let range = availableRanges.find(item => item.identifier === rangeIdentifier);
  if (range === undefined) {
    LOG.warn("Can not find range representative.",
      { range: rangeIdentifier, availableRanges });
    range = defaultRange;
  }

  return {
    // Domain
    domain,
    domainValidation: validationNoProblem(),
    availableDomains: availableDomains,
    // Domain cardinality
    domainCardinality: representProfileCardinality(domainCardinality),
    overrideDomainCardinality: domainCardinality !== null,
    domainCardinalityValidation: validationNoProblem(),
    // Range
    range,
    rangeValidation: validationNoProblem(),
    availableRanges: availableRanges,
    // Range cardinality
    rangeCardinality: representProfileCardinality(rangeCardinality),
    overrideRangeCardinality: rangeCardinality !== null,
    rangeCardinalityValidation: validationNoProblem(),
    //
    availableCardinalities: listProfileCardinalities(),
  };
}

export function createRelationshipProfileStateForEdit<RangeType extends { identifier: string }>(
  domainIdentifier: EntityDsIdentifier,
  availableDomains: EntityRepresentative[],
  domainCardinality: [number, number | null] | null,
  rangeIdentifier: EntityDsIdentifier,
  availableRanges: RangeType[],
  rangeCardinality: [number, number | null] | null,
): RelationshipProfileState<RangeType> {

  // Domain
  const domain = availableDomains.find(item => item.identifier === domainIdentifier);
  if (domain === undefined) {
    throw new RuntimeError("Can not find domain representative.")
  }

  // Range
  const range = availableRanges.find(item => item.identifier === rangeIdentifier);
  if (range === undefined) {
    throw new RuntimeError("Can not find range representative.")
  }

  return {
    // Domain
    domain,
    domainValidation: validationNoProblem(),
    // Domain cardinality
    domainCardinality: representProfileCardinality(domainCardinality),
    overrideDomainCardinality: domainCardinality !== null,
    domainCardinalityValidation: validationNoProblem(),
    availableDomains: availableDomains,
    // Range
    range,
    rangeValidation: validationNoProblem(),
    // Range cardinality
    rangeCardinality: representProfileCardinality(rangeCardinality),
    overrideRangeCardinality: rangeCardinality !== null,
    rangeCardinalityValidation: validationNoProblem(),
    availableRanges: availableRanges,
    //
    availableCardinalities: listProfileCardinalities(),
  };
}

export interface RelationshipProfileStateController<RangeType> extends RelationshipController<RangeType> {

  toggleDomainCardinalityOverride: () => void;

  toggleRangeCardinalityOverride: () => void;

}

export function createRelationshipProfileController<
  RangeType extends { identifier: string },
  State extends RelationshipProfileState<RangeType>
>(
  changeState: (next: State | ((prevState: State) => State)) => void,
): RelationshipProfileStateController<RangeType> {

  const relationshipController = createRelationshipController(changeState);

  const toggleDomainCardinalityOverride = () => {
    changeState((state) => ({
      ...state,
      overrideDomainCardinality: !state.overrideDomainCardinality,
    }));
  };

  const toggleRangeCardinalityOverride = () => {
    changeState((state) => ({
      ...state,
      overrideRangeCardinality: !state.overrideRangeCardinality,
    }));
  };

  return {
    ...relationshipController,
    toggleDomainCardinalityOverride,
    toggleRangeCardinalityOverride,
  };

}
