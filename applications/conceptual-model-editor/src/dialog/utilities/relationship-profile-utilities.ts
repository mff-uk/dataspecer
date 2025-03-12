import { LanguageString } from "@dataspecer/core/core/core-resource";
import { createLogger } from "../../application";
import { CmeModel } from "../../dataspecer/cme-model";
import { EntityDsIdentifier } from "../../dataspecer/entity-model";
import { sanitizeDuplicitiesInRepresentativeLabels } from "../../utilities/label";
import { EntityRepresentative, listProfileCardinalities, representProfileCardinality } from "./dialog-utilities";
import { RelationshipController, RelationshipState, createRelationshipController, validateRelationshipState } from "./relationship-utilities";
import { ValidationState, validationNoProblem, validationNotEvaluated } from "./validation-utilities";

const LOG = createLogger(import.meta.url);

type ItemFilter<ItemType> = (items: ItemType[], model: CmeModel) => ItemType[];

export interface RelationshipProfileState<RangeType>
  extends RelationshipState<RangeType> {

  /**
   * We keep list of all vocabularies, so we can update
   * list of represented entities.
   */
  vocabularies: CmeModel[];

  // Domain

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
   * List of all range. We use it to generate {@link availableRanges}.
   */
  allRanges: RangeType[];

  rangeValidation: ValidationState;

  // Range cardinality

  overrideRangeCardinality: boolean;

  rangeCardinalityValidation: ValidationState;

}

export function createRelationshipProfileState<RangeType extends {
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
  domainFilter: ItemFilter<EntityRepresentative>,
  invalidDomain: EntityRepresentative,
  rangeIdentifier: EntityDsIdentifier,
  rangeCardinality: [number, number | null] | null,
  allRanges: RangeType[],
  rangeFilter: ItemFilter<RangeType>,
  invalidRange: RangeType,
): RelationshipProfileState<RangeType> {

  // Filter domains for given model.
  const availableDomains = domainFilter(allDomains, model);

  // Domain
  let domain = availableDomains.find(
    item => item.identifier === domainIdentifier);
  if (domain === undefined) {
    LOG.warn("Can not find domain representative.",
      { domain: domainIdentifier, availableDomains, allDomains });
    domain = invalidDomain;
    availableDomains.push(invalidDomain);
  }

  // Filter ranges for given model.
  const availableRanges = rangeFilter(allRanges, model);

  // Range
  let range = availableRanges.find(
    item => item.identifier === rangeIdentifier);
  if (range === undefined) {
    LOG.warn("Can not find range representative.",
      { range: rangeIdentifier, availableRanges, allRanges });
    range = invalidRange;
    availableRanges.push(invalidRange);
  }

  return validateRelationshipState({
    vocabularies,
    // Domain
    domain,
    invalidDomain,
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
    invalidRange,
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

export function filterByModel<Type extends { vocabularyDsIdentifier: string }>(
  items: Type[], model: CmeModel,
): Type[] {
  return items.filter(
    item => item.vocabularyDsIdentifier === model.dsIdentifier);
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
  domainFilter: ItemFilter<EntityRepresentative>,
  rangeFilter: ItemFilter<RangeType>,
): RelationshipProfileStateController<RangeType> {

  const relationshipController = createRelationshipController(changeState);

  const onModelDidChange = (model: CmeModel) => {
    changeState((state) => {
      const result = {
        ...state,
      };

      // Update domains.
      const nextAvailableDomains = domainFilter(state.allDomains, model);
      if (nextAvailableDomains !== result.availableDomains) {
        result.availableDomains = sanitizeDuplicitiesInRepresentativeLabels(
          state.vocabularies, nextAvailableDomains);
      }

      // Check if domain is still in available domains.
      if (!result.availableDomains.includes(result.domain)) {
        result.domain = result.invalidDomain;
        result.availableDomains.push(result.invalidDomain);
      }

      // Update ranges.
      const nextAvailableRanges = rangeFilter(state.allRanges, model);
      if (nextAvailableRanges !== result.availableRanges) {
        result.availableRanges = sanitizeDuplicitiesInRepresentativeLabels(
          state.vocabularies, nextAvailableRanges);
      }

      // Check if range is still in available ranges.
      if (!result.availableRanges.includes(result.range)) {
        // We try to find an equivalent, this preserve types.
        // Alternative would be to move this to association only
        // version of the controller.
        result.range = result.availableRanges.find(
          item => item.identifier === result.range.identifier)
          ?? result.invalidRange;
        result.availableRanges.push(result.invalidRange);
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
