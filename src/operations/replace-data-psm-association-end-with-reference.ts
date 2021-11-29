import {ComplexOperation} from "../store/complex-operation";
import {OperationExecutor, StoreHavingResourceDescriptor} from "../store/operation-executor";
import {DataPsmCreateClassReference, DataPsmDeleteClass, DataPsmSetPart} from "model-driven-data/data-psm/operation";
import {DataPsmAssociationEnd, DataPsmSchema} from "model-driven-data/data-psm/model";

export class ReplaceDataPsmAssociationEndWithReference implements ComplexOperation {
    private readonly dataPsmAssociationEnd: string;
    private readonly referencedDataPsmSchema: string;

    constructor(dataPsmAssociationEnd: string, referencedDataPsmSchema: string) {
        this.dataPsmAssociationEnd = dataPsmAssociationEnd;
        this.referencedDataPsmSchema = referencedDataPsmSchema;
    }

    async execute(executor: OperationExecutor): Promise<void> {
        const schema = await executor.store.readResource(this.referencedDataPsmSchema);
        const associationEnd = await executor.store.readResource(this.dataPsmAssociationEnd);

        if (!schema || !DataPsmSchema.is(schema)) {
            throw new Error(`Schema '${this.referencedDataPsmSchema}' is not a schema.`);
        }

        if (!associationEnd || !DataPsmAssociationEnd.is(associationEnd)) {
            throw new Error(`Association end '${this.dataPsmAssociationEnd}' is not an association end.`);
        }

        const replacingClass = schema.dataPsmRoots[0];
        const storeDescriptor = new StoreHavingResourceDescriptor(this.dataPsmAssociationEnd);
        const oldClass = associationEnd.dataPsmPart;

        // Create a reference to the class

        const dataPsmCreateClassReference = new DataPsmCreateClassReference();
        dataPsmCreateClassReference.dataPsmSpecification = replacingClass;
        const dataPsmCreateClassReferenceResult = await executor.applyOperation(dataPsmCreateClassReference, storeDescriptor);
        const reference = dataPsmCreateClassReferenceResult.created[0];

        // Replace the association end with the reference

        const dataPsmSetPart = new DataPsmSetPart();
        dataPsmSetPart.dataPsmAssociationEnd = this.dataPsmAssociationEnd;
        dataPsmSetPart.dataPsmPart = reference;
        await executor.applyOperation(dataPsmSetPart, storeDescriptor);

        // Remove the old class

        if (oldClass) {
            const dataPsmDeleteClass = new DataPsmDeleteClass();
            dataPsmDeleteClass.dataPsmClass = oldClass;
            await executor.applyOperation(dataPsmDeleteClass, new StoreHavingResourceDescriptor(oldClass));
        }
    }
}
