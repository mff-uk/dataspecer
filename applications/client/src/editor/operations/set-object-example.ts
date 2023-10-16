import {PimSetObjectExample} from "@dataspecer/core/pim/operation";
import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";

export class SetObjectExample implements ComplexOperation {
  private readonly iri: string;
  private readonly examples: any[] | null;
  private store!: FederatedObservableStore;

  constructor(iri: string, examples: any[] | null) {
    this.iri = iri;
    this.examples = examples;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  async execute(): Promise<void> {
    const schema = this.store.getSchemaForResource(this.iri) as string;

    let examples = this.examples;
    if (examples && examples.length === 0) {
      console.warn("SetExample ComplexOperation: examples should not be an empty array. Setting it to null.");
      examples = null;
    }

    const pimSetExample = new PimSetObjectExample();
    pimSetExample.pimResource = this.iri;
    pimSetExample.pimObjectExample = examples;
    await this.store.applyOperation(schema, pimSetExample);
  }
}
