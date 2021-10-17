import {PimClass} from "model-driven-data/pim/model";
import {PimCreateClass} from "model-driven-data/pim/operation";
import {copyPimPropertiesFromResourceToOperation} from "./helper/copyPimPropertiesFromResourceToOperation";
import {DataPsmCreateClass, DataPsmSetRoots} from "model-driven-data/data-psm/operation";
import {ComplexOperation} from "../store/complex-operation";
import {OperationExecutor, StoreByPropertyDescriptor} from "../store/operation-executor";

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
        const pimCreateClass = new PimCreateClass();
        copyPimPropertiesFromResourceToOperation(this.pimClass, pimCreateClass);
        pimCreateClass.pimExtends = this.pimClass.pimExtends;
        const pimCreateClassResult = await executor.applyOperation(pimCreateClass, new StoreByPropertyDescriptor("pim"));

        const dataPsmCreateClass = new DataPsmCreateClass();
        dataPsmCreateClass.dataPsmInterpretation = pimCreateClassResult.created[0];
        const dataPsmCreateClassResult = await executor.applyOperation(dataPsmCreateClass, new StoreByPropertyDescriptor("dataPsm"));

        const dataPsmUpdateSchemaRoots = new DataPsmSetRoots();
        dataPsmUpdateSchemaRoots.dataPsmRoots = [dataPsmCreateClassResult.created[0]];
        await executor.applyOperation(dataPsmUpdateSchemaRoots, new StoreByPropertyDescriptor("dataPsm"));
    }
}
