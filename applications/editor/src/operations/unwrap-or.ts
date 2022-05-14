import {DataPsmUnwrapOr} from "@dataspecer/core/data-psm/operation";
import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";

export class UnwrapOr implements ComplexOperation {
  private readonly or: string;
  private readonly owner: string;
  private store!: FederatedObservableStore;

  constructor(or: string, owner: string) {
    this.or = or;
    this.owner = owner;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  async execute(): Promise<void> {
    const schema = this.store.getSchemaForResource(this.or) as string;

    const dataPsmUnwrapOr = new DataPsmUnwrapOr();
    dataPsmUnwrapOr.dataPsmOr = this.or;
    dataPsmUnwrapOr.dataPsmOwner = this.owner;
    await this.store.applyOperation(schema, dataPsmUnwrapOr);
  }
}
