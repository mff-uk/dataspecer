import { LanguageString } from "@dataspecer/core/core/core-resource";
import { createLogger } from "../../application";
import { RuntimeError } from "../../application/error";
import { CmeModel } from "../../dataspecer/cme-model";
import { EntityDsIdentifier } from "../../dataspecer/entity-model";
import { sanitizeDuplicitiesInRepresentativeLabels } from "../../utilities/label";
import { EntityRepresentative, listProfileCardinalities, representProfileCardinality } from "./dialog-utilities";
import { RelationshipController, RelationshipState, createRelationshipController, validateRelationshipState } from "./relationship-utilities";
import { ValidationState, validationNoProblem, validationNotEvaluated } from "./validation-utilities";

const LOG = createLogger(import.meta.url);

export interface RelationshipProfileState<RangeType>
  extends RelationshipState<RangeType> {

  /**
   * We keep list of all vocabularies, so we can update
   * list of represented entities.
   */
  vocabularies: CmeModel[];

  // Domain

  /**
   * Represent a value for non-set domain.
   * We use this value when there is no value for {@link availableDomains}.
   * It must not be possible to save the dialog with this value.
   */
  unsetDomain: EntityRepresentative;

  /**
   * List of all domains. We use it to generate {@link availableDomains}.
   */
  allDomains: EntityRepresentative[];

  domainValidation: ValidationState;

  // Domain cardinality

  overrideDomainCardinality: boolean;

  domainCardinalityValidation: ValidationState;

  // Range

  /**
   * Represent a value for non-set range.
   * We use this value when there is no value for {@link availableRanges}.
   * It must not be possible to save the dialog with this value.
   */
  unsetRange: RangeType;

  /**
   * List of all range. We use it to generate {@link availableRanges}.
   */
  allRanges: RangeType[];

  rangeValidation: ValidationState;

  // Range cardinality

  overrideRangeCardinality: boolean;

  rangeCardinalityValidation: ValidationState;

}

export function createRelationshipProfileStateForNew<RangeType extends {
  identifier: string,
  iri: string | null,
  label: LanguageString,
  vocabularyDsIdentifier: string,
}>(
  model: CmeModel,
  vocabularies: CmeModel[],
  domainIdentifier: EntityDsIdentifier,
  domainCardinality: [number, number | null] | null,
  allDomains: EntityRepresentative[],
  unsetDomain: EntityRepresentative,
  rangeIdentifier: EntityDsIdentifier,
  rangeCardinality: [number, number | null] | null,
  allRanges: RangeType[],
  unsetRange: RangeType,
): RelationshipProfileState<RangeType> {

  // Filter domains for given model.
  const availableDomains = filterByModel(allDomains, model);

  // Domain
  let domain = availableDomains.find(
    item => item.identifier === domainIdentifier);
  if (domain === undefined) {
    LOG.warn("Can not find domain representative.",
      { domain: domainIdentifier, availableDomains, allDomains });
    domain = unsetDomain;
    availableDomains.push(unsetDomain);
  }

  // Filter ranges for given model.
  const availableRanges = filterByModel(allRanges, model);

  // Range
  let range = allRanges.find(
    item => item.identifier === rangeIdentifier);
  if (range === undefined) {
    LOG.warn("Can not find range representative.",
      { range: rangeIdentifier, availableRanges, allRanges });
    range = unsetRange;
    availableRanges.push(unsetRange);
  }

  return validateRelationshipState({
    vocabularies,
    // Domain
    domain,
    unsetDomain,
    allDomains,
    domainValidation: validationNotEvaluated(),
    availableDomains: sanitizeDuplicitiesInRepresentativeLabels(
      vocabularies, availableDomains),
    // Domain cardinality
    domainCardinality: representProfileCardinality(domainCardinality),
    overrideDomainCardinality: domainCardinality !== null,
    domainCardinalityValidation: validationNoProblem(),
    // Range
    range,
    unsetRange,
    rangeValidation: validationNotEvaluated(),
    allRanges,
    availableRanges: sanitizeDuplicitiesInRepresentativeLabels(
      vocabularies, availableRanges),
    // Range cardinality
    rangeCardinality: representProfileCardinality(rangeCardinality),
    overrideRangeCardinality: rangeCardinality !== null,
    rangeCardinalityValidation: validationNoProblem(),
    //
    availableCardinalities: listProfileCardinalities(),
  });
}

function filterByModel<Type extends { vocabularyDsIdentifier: string }>(
  items: Type[], model: CmeModel,
): Type[] {
  return items.filter(
    item => item.vocabularyDsIdentifier === model.dsIdentifier);
}

export function createRelationshipProfileStateForEdit<RangeType extends {
  identifier: string,
  iri: string | null,
  label: LanguageString,
  vocabularyDsIdentifier: string,
}>(
  model: CmeModel,
  vocabularies: CmeModel[],
  domainIdentifier: EntityDsIdentifier,
  allDomains: EntityRepresentative[],
  domainCardinality: [number, number | null] | null,
  unsetDomain: EntityRepresentative,
  rangeIdentifier: EntityDsIdentifier,
  allRanges: RangeType[],
  rangeCardinality: [number, number | null] | null,
  unsetRange: RangeType,
): RelationshipProfileState<RangeType> {

  // Filter domains for given model.
  const availableDomains = filterByModel(allDomains, model);

  // Domain
  let domain = availableDomains.find(
    item => item.identifier === domainIdentifier);
  if (domain === undefined) {
    LOG.warn("Can not find domain representative.",
      { domain: domainIdentifier, availableDomains, allDomains });
    domain = unsetDomain;
    availableDomains.push(unsetDomain);
  }

  // Filter ranges for given model.
  const availableRanges = filterByModel(allRanges, model);

  // Range
  const range = availableRanges.find(
    item => item.identifier === rangeIdentifier);
  if (range === undefined) {
    throw new RuntimeError("Can not find range representative.")
  }

  return validateRelationshipState({
    vocabularies,
    // Domain
    domain,
    unsetDomain,
    allDomains,
    domainValidation: validationNotEvaluated(),
    availableDomains: sanitizeDuplicitiesInRepresentativeLabels(
      vocabularies, availableDomains),
    // Domain cardinality
    domainCardinality: representProfileCardinality(domainCardinality),
    overrideDomainCardinality: domainCardinality !== null,
    domainCardinalityValidation: validationNoProblem(),
    // Range
    range,
    unsetRange,
    rangeValidation: validationNotEvaluated(),
    allRanges,
    availableRanges: sanitizeDuplicitiesInRepresentativeLabels(
      vocabularies, availableRanges),
    // Range cardinality
    rangeCardinality: representProfileCardinality(rangeCardinality),
    overrideRangeCardinality: rangeCardinality !== null,
    rangeCardinalityValidation: validationNoProblem(),
    //
    availableCardinalities: listProfileCardinalities(),
  });
}

export interface RelationshipProfileStateController<RangeType>
  extends RelationshipController<RangeType> {

  /**
   * Must be called when model change.
   */
  onModelDidChange: (model: CmeModel) => void;

  toggleDomainCardinalityOverride: () => void;

  toggleRangeCardinalityOverride: () => void;

}

export function createRelationshipProfileController<
  RangeType extends {
    identifier: string,
    iri: string | null,
    label: LanguageString,
    vocabularyDsIdentifier: string,
  },
  State extends RelationshipProfileState<RangeType>
>(
  changeState: (next: State | ((prevState: State) => State)) => void,
): RelationshipProfileStateController<RangeType> {

  const relationshipController = createRelationshipController(changeState);

  const onModelDidChange = (model: CmeModel) => {
    changeState((state) => {
      const result = {
        ...state,
        availableDomains: sanitizeDuplicitiesInRepresentativeLabels(
          state.vocabularies, filterByModel(state.allDomains, model)),
        availableRanges: sanitizeDuplicitiesInRepresentativeLabels(
          state.vocabularies, filterByModel(state.allRanges, model)),
      };
      // Check if domain is still in available domains.
      if (!result.availableDomains.includes(result.domain)) {
        result.domain = result.unsetDomain;
        result.availableDomains.push(result.unsetDomain);
      }

      // Check if range is still in available ranges.
      if (!result.availableRanges.includes(result.range)) {
        result.range = result.unsetRange;
        result.availableRanges.push(result.unsetRange);
      }

      return validateRelationshipState(result);
    });
  };

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
    onModelDidChange,
    toggleDomainCardinalityOverride,
    toggleRangeCardinalityOverride,
  };

}
