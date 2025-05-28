import { Entities, Entity } from "@dataspecer/core-v2";

export type EntityModelChangeListener = (
  updated: Record<string, Entity>,
  removed: string[],
) => void;

export interface EntityModel {

  getId(): string;

  getEntities(): Entities;

  subscribeToChanges(listener: EntityModelChangeListener): () => void;

}
