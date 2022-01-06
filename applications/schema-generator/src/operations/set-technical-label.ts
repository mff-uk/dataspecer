import {DataPsmSetTechnicalLabel} from "model-driven-data/data-psm/operation";
import {ComplexOperation} from "../store/complex-operation";
import {OperationExecutor, StoreHavingResourceDescriptor} from "../store/operation-executor";

export class SetTechnicalLabel implements ComplexOperation {
  private readonly forDataPsmResourceIri: string;
  private readonly dataPsmTechnicalLabel: string;

  constructor(forDataPsmResourceIri: string, dataPsmTechnicalLabel: string) {
    this.forDataPsmResourceIri = forDataPsmResourceIri;
    this.dataPsmTechnicalLabel = dataPsmTechnicalLabel;
  }

  async execute(executor: OperationExecutor): Promise<void> {
    const dataPsmSetTechnicalLabel = new DataPsmSetTechnicalLabel();
    dataPsmSetTechnicalLabel.dataPsmResource = this.forDataPsmResourceIri;
    dataPsmSetTechnicalLabel.dataPsmTechnicalLabel = this.dataPsmTechnicalLabel;
    await executor.applyOperation(dataPsmSetTechnicalLabel, new StoreHavingResourceDescriptor(this.forDataPsmResourceIri));
  }
}
