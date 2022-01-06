import {DataPsmAssociationEnd, DataPsmClass} from "model-driven-data/data-psm/model";
import {DataPsmDeleteAssociationEnd, DataPsmDeleteClass} from "model-driven-data/data-psm/operation";
import {ComplexOperation} from "../store/complex-operation";
import {OperationExecutor, StoreHavingResourceDescriptor} from "../store/operation-executor";

export class DeleteAssociationClass implements ComplexOperation {
  private readonly association: DataPsmAssociationEnd;
  private readonly child: DataPsmClass;
  private readonly ownerClassIri: string;

  constructor(association: DataPsmAssociationEnd, child: DataPsmClass, ownerClassIri: string) {
    this.association = association;
    this.child = child;
    this.ownerClassIri = ownerClassIri;
  }

  async execute(executor: OperationExecutor): Promise<void> {
    const dataPsmDeleteAssociationEnd = new DataPsmDeleteAssociationEnd();
    dataPsmDeleteAssociationEnd.dataPsmOwner = this.ownerClassIri;
    dataPsmDeleteAssociationEnd.dataPsmAssociationEnd = this.association.iri as string;
    await executor.applyOperation(dataPsmDeleteAssociationEnd, new StoreHavingResourceDescriptor(this.ownerClassIri));

    const dataPsmDeleteClass = new DataPsmDeleteClass();
    dataPsmDeleteClass.dataPsmClass = this.child.iri as string;
    await executor.applyOperation(dataPsmDeleteClass, new StoreHavingResourceDescriptor(this.ownerClassIri));
  }
}
