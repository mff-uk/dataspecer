import { EntityModel } from "../entity-model/entity-model.ts";
import { Entities, Entity } from "../entity-model/entity.ts";
import { SemanticModelAggregator } from "./interfaces.ts";

export class AggregatorAsEntityModel implements EntityModel {
  aggregator: SemanticModelAggregator;
  id: string;
  constructor(aggregator: SemanticModelAggregator, id: string) {
    this.aggregator = aggregator;
    this.id = id;
  }
  getEntities(): Entities {
    return Object.fromEntries(Object.entries(this.aggregator.getAggregatedEntities()).map(([key, value]) => [key, value.aggregatedEntity]));
  }
  subscribeToChanges(callback: (updated: Record<string, Entity>, removed: string[]) => void) {
    this.aggregator.subscribeToChanges((updated, removed) => {
      callback(Object.fromEntries(Object.entries(updated).map(([key, value]) => [key, value.aggregatedEntity])), removed);
    });
    return () => {};
  }
  getId(): string {
    return this.id;
  }
  getAlias(): string | null {
    throw new Error("Method not implemented.");
  }
  setAlias(alias: string | null): void {
    throw new Error("Method not implemented.");
  }

  executeOperation(operation: any) {
    return this.aggregator.execOperation(operation);
  }
}