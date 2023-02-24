import {PimSetRegex} from "@dataspecer/core/pim/operation";
import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";

export class SetAttributeRegex implements ComplexOperation {
  private readonly forPimAttributeIri: string;
  private readonly regex: string | null;
  private store!: FederatedObservableStore;

  constructor(forPimAttributeIri: string, regex: string | null) {
    this.forPimAttributeIri = forPimAttributeIri;
    this.regex = regex;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  async execute(): Promise<void> {
    const schema = this.store.getSchemaForResource(this.forPimAttributeIri) as string;


    let regex = this.regex;
    if (regex === "") {
      console.warn("SetAttributeRegex ComplexOperation: regex should not be an empty string. Setting it to null.");
      regex = null;
    }

    const pimSetRegex = new PimSetRegex();
    pimSetRegex.pimAttribute = this.forPimAttributeIri;
    pimSetRegex.pimRegex = regex;
    await this.store.applyOperation(schema, pimSetRegex);
  }
}
