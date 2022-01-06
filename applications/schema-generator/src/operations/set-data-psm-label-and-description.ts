import {LanguageString} from "model-driven-data/core";
import {DataPsmSetHumanDescription, DataPsmSetHumanLabel} from "model-driven-data/data-psm/operation";
import {ComplexOperation} from "../store/complex-operation";
import {OperationExecutor, StoreHavingResourceDescriptor} from "../store/operation-executor";

export class SetDataPsmLabelAndDescription implements ComplexOperation {
  private readonly forDataPsmResourceIri: string;
  private readonly dataPsmHumanLabel: LanguageString;
  private readonly dataPsmHumanDescription: LanguageString;

  constructor(forDataPsmResourceIri: string, dataPsmHumanLabel: LanguageString, dataPsmHumanDescription: LanguageString) {
    this.forDataPsmResourceIri = forDataPsmResourceIri;
    this.dataPsmHumanLabel = dataPsmHumanLabel;
    this.dataPsmHumanDescription = dataPsmHumanDescription;
  }

  async execute(executor: OperationExecutor): Promise<void> {
    const dataPsmSetHumanLabel = new DataPsmSetHumanLabel();
    dataPsmSetHumanLabel.dataPsmResource = this.forDataPsmResourceIri;
    dataPsmSetHumanLabel.dataPsmHumanLabel = this.dataPsmHumanLabel;
    await executor.applyOperation(dataPsmSetHumanLabel, new StoreHavingResourceDescriptor(this.forDataPsmResourceIri));

    const dataPsmSetHumanDescription = new DataPsmSetHumanDescription();
    dataPsmSetHumanDescription.dataPsmResource = this.forDataPsmResourceIri;
    dataPsmSetHumanDescription.dataPsmHumanDescription = this.dataPsmHumanDescription;
    await executor.applyOperation(dataPsmSetHumanDescription, new StoreHavingResourceDescriptor(this.forDataPsmResourceIri));
  }
}
