import {DataPsmWrapWithOr} from "@dataspecer/core/data-psm/operation";
import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";

export class WrapWithOr implements ComplexOperation {
  private readonly child: string;
  private readonly owner: string;
  private store!: FederatedObservableStore;

  constructor(child: string, owner: string) {
    this.child = child;
    this.owner = owner;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  async execute(): Promise<void> {
    const schema = this.store.getSchemaForResource(this.child) as string;

    const dataPsmWrapWithOr = new DataPsmWrapWithOr();
    dataPsmWrapWithOr.dataPsmChild = this.child;
    dataPsmWrapWithOr.dataPsmOwner = this.owner;
    await this.store.applyOperation(schema, dataPsmWrapWithOr);
  }
}
