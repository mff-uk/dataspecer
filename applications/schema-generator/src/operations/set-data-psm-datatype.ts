import {DataPsmSetDatatype} from "model-driven-data/data-psm/operation";
import {ComplexOperation} from "../store/complex-operation";
import {OperationExecutor, StoreHavingResourceDescriptor} from "../store/operation-executor";

export class SetDataPsmDatatype implements ComplexOperation {
  private readonly forDataPsmAttributeIri: string;
  private readonly datatype: string | null;

  constructor(forDataPsmAttributeIri: string, datatype: string | null) {
    this.forDataPsmAttributeIri = forDataPsmAttributeIri;
    this.datatype = datatype;
  }

  async execute(executor: OperationExecutor): Promise<void> {
    let datatype = this.datatype;
    if (datatype === "") {
      console.warn("SetDataPsmDatatype ComplexOperation: Datatype should not be an empty string. Setting it to null.");
      datatype = null;
    }

    const dataPsmSetDatatype = new DataPsmSetDatatype();
    dataPsmSetDatatype.dataPsmAttribute = this.forDataPsmAttributeIri;
    dataPsmSetDatatype.dataPsmDatatype = datatype;
    await executor.applyOperation(dataPsmSetDatatype, new StoreHavingResourceDescriptor(this.forDataPsmAttributeIri));
  }
}
