import { validationError, validationNoProblem } from "../utilities/validation-utilities";
import { BaseEntityDialogState } from "./base-entity-dialog-state";

export function validateBaseEntityDialogState<
  State extends BaseEntityDialogState,
>(
  state: State,
): State {

  const iriValidation = state.iri.trim() !== "" ?
    validationNoProblem() : validationError("iri-must-not-be-empty");

  return {
    ...state,
    iriValidation,
  };
}
