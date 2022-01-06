import {LanguageString} from "@model-driven-data/core/lib/core";
import {PimSetHumanDescription, PimSetHumanLabel} from "@model-driven-data/core/lib/pim/operation";
import {ComplexOperation} from "../store/complex-operation";
import {OperationExecutor, StoreHavingResourceDescriptor} from "../store/operation-executor";

export class SetPimLabelAndDescription implements ComplexOperation {
  private readonly forPimResourceIri: string;
  private readonly pimHumanLabel: LanguageString;
  private readonly pimHumanDescription: LanguageString;

  constructor(forPimResourceIri: string, pimHumanLabel: LanguageString, pimHumanDescription: LanguageString) {
    this.forPimResourceIri = forPimResourceIri;
    this.pimHumanLabel = pimHumanLabel;
    this.pimHumanDescription = pimHumanDescription;
  }

  async execute(executor: OperationExecutor): Promise<void> {
    const pimSetHumanLabel = new PimSetHumanLabel();
    pimSetHumanLabel.pimResource = this.forPimResourceIri;
    pimSetHumanLabel.pimHumanLabel = this.pimHumanLabel;
    await executor.applyOperation(pimSetHumanLabel, new StoreHavingResourceDescriptor(this.forPimResourceIri));

    const pimSetHumanDescription = new PimSetHumanDescription();
    pimSetHumanDescription.pimResource = this.forPimResourceIri;
    pimSetHumanDescription.pimHumanDescription = this.pimHumanDescription;
    await executor.applyOperation(pimSetHumanDescription, new StoreHavingResourceDescriptor(this.forPimResourceIri));
  }
}
