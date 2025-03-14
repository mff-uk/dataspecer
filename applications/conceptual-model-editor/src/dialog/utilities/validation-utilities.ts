
export interface ValidationState {

  message: ValidationMessage | null;

}

export interface ValidationMessage {

  level: Level;

  message: string;

  args: unknown[];

}

export enum Level {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
}

const NO_PROBLEM: ValidationState = { message: null };

/**
 * Use this as an initial value for validation, just as a placeholder.
 */
export function validationNotEvaluated(): ValidationState {
  return NO_PROBLEM;
}

export function validationNoProblem(): ValidationState {
  return NO_PROBLEM;
}

export function validationWarning(
  message: string, ...args: unknown[]
): ValidationState {
  return {
    message: {
      level: Level.WARNING,
      message,
      args,
    },
  };
}

export function validationError(
  message: string, ...args: unknown[]
): ValidationState {
  return {
    message: {
      level: Level.ERROR,
      message,
      args,
    },
  };
}

export function isValid(state: ValidationState) {
  return (state?.message?.level ?? Level.INFO) !== Level.ERROR
}
