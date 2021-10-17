import {DataPsmSetDatatype} from "model-driven-data/data-psm/operation";
import {ComplexOperation} from "../store/complex-operation";
import {OperationExecutor, StoreHavingResourceDescriptor} from "../store/operation-executor";

export class SetDataPsmDatatype implements ComplexOperation {
  private readonly forDataPsmAttributeIri: string;
  private readonly datatype: string;

  constructor(forDataPsmAttributeIri: string, datatype: string) {
    this.forDataPsmAttributeIri = forDataPsmAttributeIri;
    this.datatype = datatype;
  }

  async execute(executor: OperationExecutor): Promise<void> {
    const dataPsmSetDatatype = new DataPsmSetDatatype();
    dataPsmSetDatatype.dataPsmAttribute = this.forDataPsmAttributeIri;
    dataPsmSetDatatype.dataPsmDatatype = this.datatype;
    await executor.applyOperation(dataPsmSetDatatype, new StoreHavingResourceDescriptor(this.forDataPsmAttributeIri));
  }
}
