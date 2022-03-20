import {ComplexOperation} from "@model-driven-data/federated-observable-store/complex-operation";
import {DataPsmCreateClassReference, DataPsmDeleteClass, DataPsmSetPart} from "@model-driven-data/core/data-psm/operation";
import {DataPsmAssociationEnd, DataPsmSchema} from "@model-driven-data/core/data-psm/model";
import {FederatedObservableStore} from "@model-driven-data/federated-observable-store/federated-observable-store";

export class ReplaceDataPsmAssociationEndWithReference implements ComplexOperation {
    private readonly dataPsmAssociationEnd: string;
    private readonly referencedDataPsmSchema: string;
    private store!: FederatedObservableStore;

    constructor(dataPsmAssociationEnd: string, referencedDataPsmSchema: string) {
        this.dataPsmAssociationEnd = dataPsmAssociationEnd;
        this.referencedDataPsmSchema = referencedDataPsmSchema;
    }

    setStore(store: FederatedObservableStore) {
        this.store = store;
    }

    async execute(): Promise<void> {
        const schema = await this.store.readResource(this.referencedDataPsmSchema);
        const associationEnd = await this.store.readResource(this.dataPsmAssociationEnd);

        if (!schema || !DataPsmSchema.is(schema)) {
            throw new Error(`Schema '${this.referencedDataPsmSchema}' is not a schema.`);
        }

        if (!associationEnd || !DataPsmAssociationEnd.is(associationEnd)) {
            throw new Error(`Association end '${this.dataPsmAssociationEnd}' is not an association end.`);
        }

        const replacingClass = schema.dataPsmRoots[0];
        const dataPsmSchema = this.store.getSchemaForResource(this.dataPsmAssociationEnd) as string;
        const oldClass = associationEnd.dataPsmPart;

        // Create a reference to the class

        const dataPsmCreateClassReference = new DataPsmCreateClassReference();
        dataPsmCreateClassReference.dataPsmClass = replacingClass;
        dataPsmCreateClassReference.dataPsmSpecification = schema.iri;
        const dataPsmCreateClassReferenceResult = await this.store.applyOperation(dataPsmSchema, dataPsmCreateClassReference);
        const reference = dataPsmCreateClassReferenceResult.created[0];

        // Replace the association end with the reference

        const dataPsmSetPart = new DataPsmSetPart();
        dataPsmSetPart.dataPsmAssociationEnd = this.dataPsmAssociationEnd;
        dataPsmSetPart.dataPsmPart = reference;
        await this.store.applyOperation(dataPsmSchema, dataPsmSetPart);

        // Remove the old class

        if (oldClass) {
            const oldClassSchema = this.store.getSchemaForResource(oldClass) as string;

            const dataPsmDeleteClass = new DataPsmDeleteClass();
            dataPsmDeleteClass.dataPsmClass = oldClass;
            await this.store.applyOperation(oldClassSchema, dataPsmDeleteClass);
        }
    }
}
