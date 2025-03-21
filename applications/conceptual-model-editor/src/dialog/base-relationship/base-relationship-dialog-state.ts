import { createLogger } from "../../application";
import { CmeSemanticModel } from "../../dataspecer/cme-model";
import { LanguageString } from "../../dataspecer/entity-model";
import { sanitizeDuplicitiesInRepresentativeLabels } from "../../utilities/label";
import { Cardinality, EntityRepresentative, listCardinalities, representCardinality } from "../utilities/dialog-utilities";
import { validationNotEvaluated, ValidationState } from "../utilities/validation-utilities";
import { validateBaseRelationshipDialogState } from "./base-relationship-dialog-validation";

const LOG = createLogger(import.meta.url);

export interface BaseRelationshipDialogState<RangeType> {

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
  invalidDomain: EntityRepresentative;

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
  invalidRange: RangeType;

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

export function createBaseRelationshipDialogState<RangeType extends {
  identifier: string,
  iri: string | null,
  label: LanguageString,
  vocabularyDsIdentifier: string,
}>(
  allModels: CmeSemanticModel[],
  domainIdentifier: string,
  invalidDomain: EntityRepresentative,
  domainCardinality: [number, number | null] | undefined | null,
  allDomains: EntityRepresentative[],
  rangeIdentifier: string,
  invalidRange: RangeType,
  rangeCardinality: [number, number | null] | undefined | null,
  allRanges: RangeType[],
): BaseRelationshipDialogState<RangeType> {

  let domain = allDomains.find(
    item => item.identifier === domainIdentifier);
  if (domain === undefined) {
    LOG.warn("Missing domain representative, using invalid instead.",
      { domain: domainIdentifier, availableDomains: allDomains });
    domain = invalidDomain;
    allDomains = [invalidDomain, ...allDomains];
  }

  let range = allRanges.find(
    item => item.identifier === rangeIdentifier);
  if (range === undefined) {
    LOG.warn("Missing range representative, using invalid instead.",
      { range: rangeIdentifier, availableRanges: allRanges });
    range = invalidRange;
    allRanges = [invalidRange, ...allRanges];
  }

  return validateBaseRelationshipDialogState({
    // Domain
    domain,
    invalidDomain,
    availableDomains: sanitizeDuplicitiesInRepresentativeLabels(
      allModels, allDomains),
    domainValidation: validationNotEvaluated(),
    // Domain cardinality
    domainCardinality: representCardinality(domainCardinality),
    // Range
    range,
    invalidRange,
    availableRanges: sanitizeDuplicitiesInRepresentativeLabels(
      allModels, allRanges),
    rangeValidation: validationNotEvaluated(),
    // Range cardinality
    rangeCardinality: representCardinality(rangeCardinality),
    //
    availableCardinalities: listCardinalities(),
  });
}
