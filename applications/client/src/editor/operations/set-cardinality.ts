import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";
import { modifyRelation } from "@dataspecer/core-v2/semantic-model/operations";
import { SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";

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
      ...relation,
      ends: relation.ends.map((end, index) => {
        if (index === this.end) {
          return {
            ...end,
            cardinality: [this.min ?? 0, this.max ?? null],
          };
        }
        return end;
      })
    });

    // @ts-ignore
    await this.store.applyOperation(schema, operation);
  }
}
