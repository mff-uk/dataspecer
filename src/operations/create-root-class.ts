import {PimClass} from "model-driven-data/pim/model";
import {DataPsmCreateClass, DataPsmSetRoots} from "model-driven-data/data-psm/operation";
import {ComplexOperation} from "../store/complex-operation";
import {OperationExecutor, StoreByPropertyDescriptor} from "../store/operation-executor";
import {createPimClassIfMissing} from "./helper/pim";

/**
 * For the given pimClass as the operation, it creates a new schema and new PIM and DataPSM classes representing the
 * given class.
 *
 * It is expected that the store already contains a schema.
 *
 * Schema roots are overwritten, but the class tree is not removed. This operation expects empty store having only a
 * schema.
 */
export class CreateRootClass implements ComplexOperation {
    private readonly pimClass: PimClass;

    constructor(pimClass: PimClass) {
        this.pimClass = pimClass;
    }

    async execute(executor: OperationExecutor): Promise<void> {
        const pimClassIri = await createPimClassIfMissing(this.pimClass, new StoreByPropertyDescriptor(["pim", "root"]), executor);

        const dataPsmCreateClass = new DataPsmCreateClass();
        dataPsmCreateClass.dataPsmInterpretation = pimClassIri;
        const dataPsmCreateClassResult = await executor.applyOperation(dataPsmCreateClass, new StoreByPropertyDescriptor(["data-psm", "root"]));

        const dataPsmUpdateSchemaRoots = new DataPsmSetRoots();
        dataPsmUpdateSchemaRoots.dataPsmRoots = [dataPsmCreateClassResult.created[0]];
        await executor.applyOperation(dataPsmUpdateSchemaRoots, new StoreByPropertyDescriptor(["data-psm", "root"]));
    }
}
