import {DataPsmCreateSchema} from "model-driven-data/data-psm/operation";
import {PimCreateSchema} from "model-driven-data/pim/operation";
import {ComplexOperation} from "../store/complex-operation";
import {OperationExecutor, StoreByPropertyDescriptor} from "../store/operation-executor";

export class CreateSchema implements ComplexOperation {
    public createdDataPsmSchema: string | null = null;
    private pimBaseIri: string;
    private dataPsmBaseIri: string;

    constructor(pimBaseIri: string, dataPsmBaseIri: string) {
        this.pimBaseIri = pimBaseIri;
        this.dataPsmBaseIri = dataPsmBaseIri;
    }

    async execute(executor: OperationExecutor): Promise<void> {
        const pimCreateSchema = new PimCreateSchema();
        await executor.applyOperation(pimCreateSchema, new StoreByPropertyDescriptor(["pim", "root"]));

        const dataPsmCreateSchema = new DataPsmCreateSchema();
        const result = await executor.applyOperation(dataPsmCreateSchema, new StoreByPropertyDescriptor(["data-psm", "root"]));

        this.createdDataPsmSchema = result.created[0];
    }
}
