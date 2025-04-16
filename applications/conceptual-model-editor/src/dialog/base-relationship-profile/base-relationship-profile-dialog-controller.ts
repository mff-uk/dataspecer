import { CmeSemanticModel } from "../../dataspecer/cme-model";
import { LanguageString } from "../../dataspecer/entity-model";
import { sanitizeDuplicitiesInRepresentativeLabels } from "../../utilities/label";
import {
  type BaseRelationshipDialogController,
  createBaseRelationshipDialogController,
} from "../base-relationship/base-relationship-dialog-controller";
import { validateBaseRelationshipDialogState } from "../base-relationship/base-relationship-dialog-validation";
import { EntityRepresentative } from "../utilities/dialog-utilities";
import { BaseRelationshipProfileDialogState, ItemFilter } from "./base-relationship-profile-dialog-state";

export interface BaseRelationshipProfileDialogController<RangeType>
  extends BaseRelationshipDialogController<RangeType> {

  /**
   * Must be called when model change.
   */
  onModelDidChange: (model: CmeSemanticModel) => void;

  toggleDomainCardinalityOverride: () => void;

  toggleRangeCardinalityOverride: () => void;

  setMandatoryLevel: (value: string) => void;

}

export function createBaseRelationshipProfileDialogController<
  RangeType extends {
    identifier: string,
    iri: string | null,
    label: LanguageString,
    model: string,
  },
  State extends BaseRelationshipProfileDialogState<RangeType>
>(
  changeState: (next: State | ((prevState: State) => State)) => void,
  domainFilter: ItemFilter<EntityRepresentative>,
  rangeFilter: ItemFilter<RangeType>,
): BaseRelationshipProfileDialogController<RangeType> {

  const relationshipController = createBaseRelationshipDialogController(
    changeState);

  const onModelDidChange = (model: CmeSemanticModel) => {
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

      return validateBaseRelationshipDialogState(result);
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

  const setMandatoryLevel = (value: string) => changeState(state => ({
    ...state,
    mandatoryLevel: value,
  }));

  return {
    ...relationshipController,
    onModelDidChange,
    toggleDomainCardinalityOverride,
    toggleRangeCardinalityOverride,
    setMandatoryLevel,
  };
}
