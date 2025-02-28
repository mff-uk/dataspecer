import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { createLogger } from "../../application";
import { CmeModel } from "../../dataspecer/cme-model";
import { sanitizeDuplicitiesInRepresentativeLabels } from "../../utilities/label";
import { Cardinality, EntityRepresentative, listCardinalities, representCardinality } from "./dialog-utilities";
import { removeFromArray } from "../../utilities/functional";
import { validationError, validationNoProblem, validationNotEvaluated, ValidationState } from "./validation-utilities";

const LOG = createLogger(import.meta.url);

export interface RelationshipState<RangeType> {

  /**
   * Domain.
   */
  domain: EntityRepresentative;

  /**
   * Represent a value for non-set domain.
   * We use this value when there is no value for {@link availableDomains}.
   * It must not be possible to save the dialog with this value.
   * We use this also to represent an invalid state.
   */
  unsetDomain: EntityRepresentative;

  /**
   * Available domain items to select from.
   */
  availableDomains: EntityRepresentative[];

  domainValidation: ValidationState;

  /**
   * Domain cardinality.
   */
  domainCardinality: Cardinality;

  /**
   * Range.
   */
  range: RangeType;

  /**
   * Represent a value for non-set range.
   * We use this value when there is no value for {@link availableRanges}.
   * It must not be possible to save the dialog with this value.
   * We use this also to represent an invalid state.
   */
  unsetRange: RangeType;

  /**
   * Available range items to select from.
   */
  availableRanges: RangeType[];

  rangeValidation: ValidationState;

  /**
   * Range cardinality.
   */
  rangeCardinality: Cardinality;

  /**
   * Cardinalities that can be set.
   */
  availableCardinalities: Cardinality[];
}

export function createRelationshipStateForNew<RangeType extends {
  identifier: string,
  iri: string | null,
  label: LanguageString,
  vocabularyDsIdentifier: string,
}>(
  vocabularies: CmeModel[],
  domain: EntityRepresentative,
  unsetDomain: EntityRepresentative,
  availableDomains: EntityRepresentative[],
  range: RangeType,
  unsetRange: RangeType,
  availableRanges: RangeType[],
): RelationshipState<RangeType> {

  if (!availableDomains.includes(domain)) {
    LOG.warn("Missing domain representative, using unset instead.",
      { domain, availableDomains });
    domain = unsetDomain;
    availableDomains = [unsetDomain, ...availableDomains];
  }

  if (!availableRanges.includes(range)) {
    LOG.warn("Missing range representative, using unset instead.",
      { range, availableRanges });
    range = unsetRange;
    availableRanges = [unsetRange, ...availableRanges];
  }

  return validateRelationshipState({
    // Domain
    domain,
    unsetDomain,
    domainValidation: validationNotEvaluated(),
    // Domain cardinality
    domainCardinality: representCardinality(null),
    availableDomains: sanitizeDuplicitiesInRepresentativeLabels(
      vocabularies, availableDomains),
    // Range
    range,
    unsetRange,
    availableRanges: sanitizeDuplicitiesInRepresentativeLabels(
      vocabularies, availableRanges),
    rangeValidation: validationNotEvaluated(),
    // Range cardinality
    rangeCardinality: representCardinality(null),
    availableCardinalities: listCardinalities(),
  });
}

export function validateRelationshipState<
  RangeType, StateType extends RelationshipState<RangeType>,
>(state: StateType): StateType {
  const result = {
    ...state,
  };
  if (result.domain === result.unsetDomain) {
    result.domainValidation = validationError("domain-must-be-set");
  } else {
    result.domainValidation = validationNoProblem();
  }
  if (result.range === result.unsetRange) {
    result.rangeValidation = validationError("range-must-be-set");
  } else {
    result.rangeValidation = validationNoProblem();
  }
  return result;
}

export function createRelationshipStateForEdit<RangeType extends {
  identifier: string,
  iri: string | null,
  label: LanguageString,
  vocabularyDsIdentifier: string,
}>(
  vocabularies: CmeModel[],
  domainIdentifier: string,
  unsetDomain: EntityRepresentative,
  domainCardinality: [number, number | null] | undefined | null,
  availableDomains: EntityRepresentative[],
  rangeIdentifier: string,
  unsetRange: RangeType,
  rangeCardinality: [number, number | null] | undefined | null,
  availableRanges: RangeType[],
): RelationshipState<RangeType> {

  let domain = availableDomains.find(
    item => item.identifier === domainIdentifier);
  if (domain === undefined) {
    LOG.warn("Missing domain representative, using unset instead.",
      { domain: domainIdentifier, availableDomains });
    domain = unsetDomain;
    availableDomains = [unsetDomain, ...availableDomains];
  }

  let range = availableRanges.find(
    item => item.identifier === rangeIdentifier);
  if (range === undefined) {
    LOG.warn("Missing range representative, using unset instead.",
      { range: rangeIdentifier, availableRanges });
    range = unsetRange;
    availableRanges = [unsetRange, ...availableRanges];
  }

  return validateRelationshipState({
    // Domain
    domain,
    unsetDomain,
    availableDomains: sanitizeDuplicitiesInRepresentativeLabels(
      vocabularies, availableDomains),
    domainValidation: validationNotEvaluated(),
    // Domain cardinality
    domainCardinality: representCardinality(domainCardinality),
    // Range
    range,
    unsetRange,
    availableRanges: sanitizeDuplicitiesInRepresentativeLabels(
      vocabularies, availableRanges),
    rangeValidation: validationNotEvaluated(),
    // Range cardinality
    rangeCardinality: representCardinality(rangeCardinality),
    //
    availableCardinalities: listCardinalities(),
  });
}

export interface RelationshipController<RangeType> {

  setDomain: (value: EntityRepresentative) => void;

  setDomainCardinality: (value: Cardinality) => void;

  setRange: (value: RangeType) => void;

  setRangeCardinality: (value: Cardinality) => void;

}

export function createRelationshipController<
  RangeType, State extends RelationshipState<RangeType>
>(
  changeState: (next: State | ((prevState: State) => State)) => void,
): RelationshipController<RangeType> {

  const setDomain = (value: EntityRepresentative) => changeState((state) => {
    const result = {
      ...state,
      domain: value,
    };
    if (state.unsetDomain === state.domain) {
      // We change value from unset, we need to remove that option from
      // the list.
      result.availableDomains = removeFromArray(
        state.unsetDomain, state.availableDomains);
    }
    return validateRelationshipState(result);
  });

  const setDomainCardinality = (value: Cardinality) => {
    changeState((state) => ({ ...state, domainCardinality: value }));
  };

  const setRange = (value: RangeType) => changeState((state) => {
    const result = {
      ...state,
      range: value,
    };
    if (state.unsetRange === state.range) {
      // We change value from unset, we need to remove that option from
      // the list.
      result.availableRanges = removeFromArray(
        state.unsetRange, state.availableRanges);
    }
    return validateRelationshipState(result);
  });

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
