import { Entities } from "@dataspecer/core-v2";
import { EntityModel } from "./entity-model.ts";

class ReadOnlyInMemoryEntityModel implements EntityModel {

  readonly identifier: string;

  readonly entities: Entities = {};

  constructor(identifier: string, entities: Entities) {
    this.identifier = identifier;
    // We create a copy.
    this.entities = { ...entities };
  }

  getId(): string {
    return this.identifier;
  }

  getEntities(): Entities {
    return this.entities;
  }

  subscribeToChanges(): () => void {
    // This is read only model.
    return () => { };
  }

}

export function createReadOnlyInMemoryEntityModel(
  identifier: string, entities: Entities,
): EntityModel {
  return new ReadOnlyInMemoryEntityModel(identifier, entities);
}
