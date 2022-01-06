import {DataPsmAttribute, DataPsmClass} from "model-driven-data/data-psm/model";
import {DataPsmDeleteAttribute} from "model-driven-data/data-psm/operation";
import {ComplexOperation} from "../store/complex-operation";
import {OperationExecutor, StoreHavingResourceDescriptor} from "../store/operation-executor";

export class DeleteAttribute implements ComplexOperation {
  private attribute: DataPsmAttribute;
  private ownerClass: DataPsmClass;

  constructor(attribute: DataPsmAttribute, ownerClass: DataPsmClass) {
    this.attribute = attribute;
    this.ownerClass = ownerClass;
  }

  async execute(executor: OperationExecutor): Promise<void> {
    const dataPsmDeleteAttribute = new DataPsmDeleteAttribute();
    dataPsmDeleteAttribute.dataPsmAttribute = this.attribute.iri as string;
    dataPsmDeleteAttribute.dataPsmOwner = this.ownerClass.iri as string;
    await executor.applyOperation(dataPsmDeleteAttribute, new StoreHavingResourceDescriptor(this.attribute.iri as string));

    // const pimAttribute = await executor.store.readResource(this.attribute.dataPsmInterpretation) as PimAttribute;
    //
    // const pimDeleteAttribute = new PimDeleteAttribute();
    // pimDeleteAttribute.pimAttribute = pimAttribute.iri ?? null;
    // pimDeleteAttribute.parent = pimAttribute.pimOwnerClass;
    // await executor.applyOperation(pimDeleteAttribute, new StoreHavingResourceDescriptor(this.attribute.dataPsmInterpretation));
  }
}
