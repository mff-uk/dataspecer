import {DataPsmOr} from "@dataspecer/core/data-psm/model";
import {DataPsmUnsetChoice} from "@dataspecer/core/data-psm/operation";
import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";

export class DeleteChoice implements ComplexOperation {
  private OrIri: string;
  private index: number;
  private store!: FederatedObservableStore;

  constructor(OrIri: string, index: number) {
    this.OrIri = OrIri;
    this.index = index;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  async execute(): Promise<void> {
    const schema = this.store.getSchemaForResource(this.OrIri) as string;

    const or = await this.store.readResource(this.OrIri) as DataPsmOr;

    const choiceIriToRemove = or.dataPsmChoices[this.index];

    const dataPsmUnsetChoice = new DataPsmUnsetChoice();
    dataPsmUnsetChoice.dataPsmOr = this.OrIri;
    dataPsmUnsetChoice.dataPsmChoice = choiceIriToRemove as string;
    await this.store.applyOperation(schema, dataPsmUnsetChoice);
  }
}
