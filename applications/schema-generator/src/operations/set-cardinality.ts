import {ComplexOperation} from "@model-driven-data/federated-observable-store/complex-operation";
import {PimSetCardinality} from "@model-driven-data/core/pim/operation/pim-set-cardinality";
import {FederatedObservableStore} from "@model-driven-data/federated-observable-store/federated-observable-store";

export class SetCardinality implements ComplexOperation {
  readonly pimResource: string;
  readonly pimCardinalityMin: number | null;
  readonly pimCardinalityMax: number | null;
  private store!: FederatedObservableStore;

  constructor(pimResource: string, pimCardinalityMin: number | null, pimCardinalityMax: number | null) {
    this.pimResource = pimResource;
    this.pimCardinalityMin = pimCardinalityMin;
    this.pimCardinalityMax = pimCardinalityMax;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  async execute(): Promise<void> {
    const schema = this.store.getSchemaForResource(this.pimResource) as string;

    const pimSetCardinality = new PimSetCardinality();
    pimSetCardinality.pimResource = this.pimResource;
    pimSetCardinality.pimCardinalityMin = this.pimCardinalityMin;
    pimSetCardinality.pimCardinalityMax = this.pimCardinalityMax;
    await this.store.applyOperation(schema, pimSetCardinality);
  }
}
