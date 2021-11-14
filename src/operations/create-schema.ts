import {DataPsmCreateSchema} from "model-driven-data/data-psm/operation";
import {PimCreateSchema} from "model-driven-data/pim/operation";
import {ComplexOperation} from "../store/complex-operation";
import {OperationExecutor, StoreByPropertyDescriptor} from "../store/operation-executor";
import {SCHEMA} from "model-driven-data/pim/pim-vocabulary";

export class CreateSchema implements ComplexOperation {
    public createdDataPsmSchema: string | null = null;
    private pimBaseIri: string;
    private dataPsmBaseIri: string;

    constructor(pimBaseIri: string, dataPsmBaseIri: string) {
        this.pimBaseIri = pimBaseIri;
        this.dataPsmBaseIri = dataPsmBaseIri;
    }

    async execute(executor: OperationExecutor): Promise<void> {
        const schemas = await executor.store.listResourcesOfType(SCHEMA, new StoreByPropertyDescriptor(["pim", "root"]));

        if (schemas.length === 0) {
            const pimCreateSchema = new PimCreateSchema();
            await executor.applyOperation(pimCreateSchema, new StoreByPropertyDescriptor(["pim", "root"]));
        }

        const dataPsmCreateSchema = new DataPsmCreateSchema();
        const result = await executor.applyOperation(dataPsmCreateSchema, new StoreByPropertyDescriptor(["data-psm", "root"]));

        this.createdDataPsmSchema = result.created[0];
    }
}
