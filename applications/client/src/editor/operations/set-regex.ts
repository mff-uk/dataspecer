import {PimSetRegex} from "@dataspecer/core/pim/operation";
import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";

export class SetRegex implements ComplexOperation {
  private readonly iri: string;
  private readonly regex: string | null;
  private store!: FederatedObservableStore;

  constructor(iri: string, regex: string | null) {
    this.iri = iri;
    this.regex = regex;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  async execute(): Promise<void> {
    const schema = this.store.getSchemaForResource(this.iri) as string;


    let regex = this.regex;
    if (regex === "") {
      console.warn("SetRegex ComplexOperation: regex should not be an empty string. Setting it to null.");
      regex = null;
    }

    const pimSetRegex = new PimSetRegex();
    pimSetRegex.pimResource = this.iri;
    pimSetRegex.pimRegex = regex;
    await this.store.applyOperation(schema, pimSetRegex);
  }
}
