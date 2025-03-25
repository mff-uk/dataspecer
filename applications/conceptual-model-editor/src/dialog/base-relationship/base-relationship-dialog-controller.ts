import { removeFromArray } from "../../utilities/functional";
import { Cardinality, EntityRepresentative } from "../utilities/dialog-utilities";
import { BaseRelationshipDialogState } from "./base-relationship-dialog-state";
import { validateBaseRelationshipDialogState } from "./base-relationship-dialog-validation";

export interface BaseRelationshipDialogController<RangeType> {

  setDomain: (value: EntityRepresentative) => void;

  setDomainCardinality: (value: Cardinality) => void;

  setRange: (value: RangeType) => void;

  setRangeCardinality: (value: Cardinality) => void;

}

export function createBaseRelationshipDialogController<
  RangeType,
  State extends BaseRelationshipDialogState<RangeType>
>(
  changeState: (next: State | ((prevState: State) => State)) => void,
): BaseRelationshipDialogController<RangeType> {

  const setDomain = (value: EntityRepresentative) => changeState((state) => {
    const result = {
      ...state,
      domain: value,
    };
    if (state.invalidDomain === state.domain) {
      // We change value from unset, we need to remove that option from
      // the list.
      result.availableDomains = removeFromArray(
        state.invalidDomain, state.availableDomains);
    }
    return validateBaseRelationshipDialogState(result);
  });

  const setDomainCardinality = (value: Cardinality) => {
    changeState((state) => ({ ...state, domainCardinality: value }));
  };

  const setRange = (value: RangeType) => changeState((state) => {
    const result = {
      ...state,
      range: value,
    };
    if (state.invalidRange === state.range) {
      // We change value from unset, we need to remove that option from
      // the list.
      result.availableRanges = removeFromArray(
        state.invalidRange, state.availableRanges);
    }
    return validateBaseRelationshipDialogState(result);
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
