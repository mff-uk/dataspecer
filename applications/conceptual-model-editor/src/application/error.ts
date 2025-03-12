import { Entity } from "@dataspecer/core-v2";

/**
 * Base exception for runtime error.
 */
export class RuntimeError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/**
 * @throws {RuntimeError} When assertion fail.
 */
export function assert(
  condition: boolean, message: string, ...optionalParams: any[]
) {
  if (condition) {
    // Condition holds
    return;
  }
  console.error("Assert failed!", { message, optionalParams });
  throw new RuntimeError(message);
}

/**
 * Use this exception to report invalid application state.
 * Report details using logger.
 */
export class InvalidState extends RuntimeError {
  constructor() {
    super("Invalid application state.");
  }
}

/**
 * Use this operation when user try to execute an operation
 * which is undefined or made no sense in given context.
 *
 * In general this may sometimes collide with {@link InvalidState}.
 */
export class UnsupportedOperationException extends RuntimeError {
  constructor() {
    super("Unsupported operation.");
  }
}

/**
 * Used when writable model is expected but not found.
 * @deprecated Use {@link InvalidState}.
 */
export class NoWritableModelFound extends RuntimeError {
  constructor() {
    super("Missing writable vocabulary.");
  }
}

/**
 * Use when you can not find a model with a given identifier.
 * @deprecated Use {@link InvalidState}.
 */
export class MissingModel extends RuntimeError {
  constructor(identifier: string) {
    super(`Missing vocabulary '${identifier}'.`);
  }
}

/**
 * Use when there is an issue with aggregated entity, e.g.
 * the type does not match.
 * @deprecated Use {@link InvalidState}.
 */
export class InvalidAggregation extends RuntimeError {

  aggregated: Entity | null;

  constructor(identifier: string, aggregated: Entity | null) {
    super(`Invalid aggregation of entity '${identifier}'.`);
    this.aggregated = aggregated;
  }
}

/**
 * Use when you expect relationship to have a range but it does not have one.
 * @deprecated Use {@link InvalidState}.
 */
export class MissingRelationshipEnds extends RuntimeError {
  constructor(entity: Entity) {
    super(`Missing ends for relationship '${entity.id}'.`);
  }
}

/**
 * Use when profiled entity can not be found.
 * @deprecated Use {@link InvalidState}.
 */
export class MissingProfile extends RuntimeError {
  constructor(identifier: string) {
    super(`Missing profile entity '${identifier}'.`);
  }
}

/**
 * Use when you expect to find an entity and fail.
 * @deprecated Use {@link InvalidState}.
 */
export class MissingEntity extends RuntimeError {
  constructor(identifier: string) {
    super(`Missing entity '${identifier}'.`);
  }
}
