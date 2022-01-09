import {PimClass} from "@model-driven-data/core/pim/model";
import {DataPsmCreateClass, DataPsmSetHumanDescription, DataPsmSetHumanLabel, DataPsmSetRoots} from "@model-driven-data/core/data-psm/operation";
import {ComplexOperation} from "../store/complex-operation";
import {OperationExecutor, StoreByPropertyDescriptor} from "../store/operation-executor";
import {createPimClassIfMissing} from "./helper/pim";
import {SCHEMA} from "@model-driven-data/core/data-psm/data-psm-vocabulary";
import {LanguageString} from "@model-driven-data/core/core";

/**
 * For the given pimClass, it creates a new schema and new PIM and DataPSM classes representing the given class.
 *
 * It is expected that the store already contains a schema.
 *
 * Schema roots are overwritten, but the class tree is not removed. This operation expects empty store having only a
 * schema.
 */
export class CreateRootClass implements ComplexOperation {
    private readonly pimClass: PimClass;
    private readonly schemaHumanLabel?: LanguageString;
    private readonly schemaHumanDescription?: LanguageString;

    constructor(pimClass: PimClass, schemaHumanLabel?: LanguageString, schemaHumanDescription?: LanguageString) {
        this.pimClass = pimClass;
        this.schemaHumanLabel = schemaHumanLabel;
        this.schemaHumanDescription = schemaHumanDescription;
    }

    async execute(executor: OperationExecutor): Promise<void> {
        const dataPsmStoreDescriptor = new StoreByPropertyDescriptor(["data-psm", "root"]);

        const pimClassIri = await createPimClassIfMissing(this.pimClass, new StoreByPropertyDescriptor(["pim", "root"]), executor);

        const dataPsmCreateClass = new DataPsmCreateClass();
        dataPsmCreateClass.dataPsmInterpretation = pimClassIri;
        const dataPsmCreateClassResult = await executor.applyOperation(dataPsmCreateClass, dataPsmStoreDescriptor);

        const dataPsmUpdateSchemaRoots = new DataPsmSetRoots();
        dataPsmUpdateSchemaRoots.dataPsmRoots = [dataPsmCreateClassResult.created[0]];
        await executor.applyOperation(dataPsmUpdateSchemaRoots, dataPsmStoreDescriptor);

        // Schema label and description

        const schemas = await executor.store.listResourcesOfType(SCHEMA, dataPsmStoreDescriptor);
        const schemaIri = schemas[0] as string;

        if (this.schemaHumanLabel) {
            const dataPsmSetHumanLabel = new DataPsmSetHumanLabel();
            dataPsmSetHumanLabel.dataPsmResource = schemaIri;
            dataPsmSetHumanLabel.dataPsmHumanLabel = this.schemaHumanLabel;
            await executor.applyOperation(dataPsmSetHumanLabel, dataPsmStoreDescriptor);
        }

        if (this.schemaHumanDescription) {
            const dataPsmSetHumanDescription = new DataPsmSetHumanDescription();
            dataPsmSetHumanDescription.dataPsmResource = schemaIri;
            dataPsmSetHumanDescription.dataPsmHumanDescription = this.schemaHumanDescription;
            await executor.applyOperation(dataPsmSetHumanDescription, dataPsmStoreDescriptor);
        }
    }
}
