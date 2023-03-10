import {PimSetExample} from "@dataspecer/core/pim/operation";
import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";

export class SetExample implements ComplexOperation {
  private readonly iri: string;
  private readonly examples: string[] | null;
  private store!: FederatedObservableStore;

  constructor(iri: string, examples: string[] | null) {
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

    const pimSetExample = new PimSetExample();
    pimSetExample.pimResource = this.iri;
    pimSetExample.pimExample = examples;
    await this.store.applyOperation(schema, pimSetExample);
  }
}
