import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";
import { modifyRelation } from "@dataspecer/core-v2/semantic-model/operations";
import { SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { DataPsmSetCardinality } from "@dataspecer/core/data-psm/operation";

export class SetCardinality implements ComplexOperation {
  readonly semanticModelRelationshipId: string;
  readonly end: number;
  readonly min: number | null;
  readonly max: number | null;
  private store!: FederatedObservableStore;

  constructor(semanticModelRelationshipId: string, end: number, min: number | null, max: number | null) {
    this.semanticModelRelationshipId = semanticModelRelationshipId;
    this.end = end;
    this.min = min;
    this.max = max;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  async execute(): Promise<void> {
    const schema = this.store.getSchemaForResource(this.semanticModelRelationshipId) as string;
    const relation = await this.store.readResource(this.semanticModelRelationshipId) as SemanticModelRelationship;

    const operation = modifyRelation(this.semanticModelRelationshipId, {
      // @ts-ignore
      ends: relation.ends.map((_, index) => {
        if (index === this.end) {
          return {
            cardinality: [this.min ?? 0, this.max ?? null],
          };
        } else {
          return {};
        }
      })
    });

    // @ts-ignore
    await this.store.applyOperation(schema, operation);
  }
}

/**
 * Operation that will set the cardinality of a PSM element.
 * It should eventually replace SetCardinality.
 */
export class SetCardinalityPsm implements ComplexOperation {
  private readonly entityId: string;
  private readonly min: number;
  private readonly max: number;

  private store!: FederatedObservableStore;

  constructor(entityId: string, min: number, max: number | null) {
    this.entityId = entityId;
    this.min = min;
    this.max = max;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  async execute(): Promise<void> {
    const schema = this.store.getSchemaForResource(this.entityId) as string;

    const operation = new DataPsmSetCardinality();
    operation.entityId = this.entityId;
    operation.dataPsmCardinality = [this.min, this.max];

    await this.store.applyOperation(schema, operation);
  }
}
