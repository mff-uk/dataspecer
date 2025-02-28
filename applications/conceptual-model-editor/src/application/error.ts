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
 * Used when writable model is expected but not found.
 */
export class NoWritableModelFound extends RuntimeError {
  constructor() {
    super("Missing writable vocabulary.");
  }
}

/**
 * Use when you can not find a model with a given identifier.
 */
export class MissingModel extends RuntimeError {
  constructor(identifier: string) {
    super(`Missing vocabulary '${identifier}'.`);
  }
}

/**
 * Use when there is an issue with aggregated entity, e.g.
 * the type does not match.
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
 */
export class MissingRelationshipEnds extends RuntimeError {
  constructor(entity: Entity) {
    super(`Missing ends for relationship '${entity.id}'.`);
  }
}

/**
 * Use when profiled entity can not be found.
 */
export class MissingProfile extends RuntimeError {
  constructor(identifier: string) {
    super(`Missing profile entity '${identifier}'.`);
  }
}

/**
 * Use when you expect to find an entity and fail.
 */
export class MissingEntity extends RuntimeError {
  constructor(identifier: string) {
    super(`Missing entity '${identifier}'.`);
  }
}
