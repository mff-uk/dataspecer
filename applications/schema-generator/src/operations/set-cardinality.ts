import {ComplexOperation} from "../store/complex-operation";
import {OperationExecutor, StoreHavingResourceDescriptor} from "../store/operation-executor";
import {PimSetCardinality} from "@model-driven-data/core/pim/operation/pim-set-cardinality";

export class SetCardinality implements ComplexOperation {
  readonly pimResource: string;
  readonly pimCardinalityMin: number | null;
  readonly pimCardinalityMax: number | null;

  constructor(pimResource: string, pimCardinalityMin: number | null, pimCardinalityMax: number | null) {
    this.pimResource = pimResource;
    this.pimCardinalityMin = pimCardinalityMin;
    this.pimCardinalityMax = pimCardinalityMax;
  }

  async execute(executor: OperationExecutor): Promise<void> {
    const pimSetCardinality = new PimSetCardinality();
    pimSetCardinality.pimResource = this.pimResource;
    pimSetCardinality.pimCardinalityMin = this.pimCardinalityMin;
    pimSetCardinality.pimCardinalityMax = this.pimCardinalityMax;
    await executor.applyOperation(pimSetCardinality, new StoreHavingResourceDescriptor(this.pimResource));
  }
}
