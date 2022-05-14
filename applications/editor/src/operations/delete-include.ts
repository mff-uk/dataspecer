import {DataPsmDeleteInclude} from "@dataspecer/core/data-psm/operation";
import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";

export class DeleteInclude implements ComplexOperation {
  private readonly include: string;
  private readonly ownerClass: string;
  private store!: FederatedObservableStore;

  constructor(include: string, ownerClass: string) {
    this.include = include;
    this.ownerClass = ownerClass;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  async execute(): Promise<void> {
    const schema = this.store.getSchemaForResource(this.include) as string;

    const dataPsmDeleteInclude = new DataPsmDeleteInclude();
    dataPsmDeleteInclude.dataPsmInclude = this.include;
    dataPsmDeleteInclude.dataPsmOwner = this.ownerClass;
    await this.store.applyOperation(schema, dataPsmDeleteInclude);
  }
}
