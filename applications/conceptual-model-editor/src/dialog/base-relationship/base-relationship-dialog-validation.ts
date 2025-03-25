import { validationError, validationNoProblem } from "../utilities/validation-utilities";
import { BaseRelationshipDialogState } from "./base-relationship-dialog-state";

export function validateBaseRelationshipDialogState<
  RangeType,
  StateType extends BaseRelationshipDialogState<RangeType>,
>(state: StateType): StateType {
  const result = {
    ...state,
  };
  if (result.domain === result.invalidDomain) {
    result.domainValidation = validationError("domain-must-be-set");
  } else {
    result.domainValidation = validationNoProblem();
  }
  if (result.range === result.invalidRange) {
    result.rangeValidation = validationError("range-must-be-set");
  } else {
    result.rangeValidation = validationNoProblem();
  }
  return result;
}
