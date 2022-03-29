import {PimClass} from "@model-driven-data/core/pim/model";
import {DataPsmCreateClass, DataPsmSetHumanDescription, DataPsmSetHumanLabel, DataPsmSetRoots} from "@model-driven-data/core/data-psm/operation";
import {ComplexOperation} from "@model-driven-data/federated-observable-store/complex-operation";
import {createPimClassIfMissing} from "./helper/pim";
import {LanguageString} from "@model-driven-data/core/core";
import {FederatedObservableStore} from "@model-driven-data/federated-observable-store/federated-observable-store";

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
    private readonly pimSchemaIri: string;
    private readonly dataPsmSchemaIri: string;
    private readonly schemaHumanLabel?: LanguageString;
    private readonly schemaHumanDescription?: LanguageString;
    private store!: FederatedObservableStore;

    constructor(pimClass: PimClass, pimSchemaIri: string, dataPsmSchemaIri: string, schemaHumanLabel?: LanguageString, schemaHumanDescription?: LanguageString) {
        this.pimClass = pimClass;
        this.pimSchemaIri = pimSchemaIri;
        this.dataPsmSchemaIri = dataPsmSchemaIri;
        this.schemaHumanLabel = schemaHumanLabel;
        this.schemaHumanDescription = schemaHumanDescription;
    }

    setStore(store: FederatedObservableStore) {
        this.store = store;
    }

    async execute(): Promise<void> {
        const pimClassIri = await createPimClassIfMissing(this.pimClass, this.pimSchemaIri, this.store);

        const dataPsmCreateClass = new DataPsmCreateClass();
        dataPsmCreateClass.dataPsmInterpretation = pimClassIri;
        const dataPsmCreateClassResult = await this.store.applyOperation(this.dataPsmSchemaIri, dataPsmCreateClass);

        const dataPsmUpdateSchemaRoots = new DataPsmSetRoots();
        dataPsmUpdateSchemaRoots.dataPsmRoots = [dataPsmCreateClassResult.created[0]];
        await this.store.applyOperation(this.dataPsmSchemaIri, dataPsmUpdateSchemaRoots);

        // Schema label and description

        if (this.schemaHumanLabel) {
            const dataPsmSetHumanLabel = new DataPsmSetHumanLabel();
            dataPsmSetHumanLabel.dataPsmResource = this.dataPsmSchemaIri;
            dataPsmSetHumanLabel.dataPsmHumanLabel = this.schemaHumanLabel;
            await this.store.applyOperation(this.dataPsmSchemaIri, dataPsmSetHumanLabel);
        }

        if (this.schemaHumanDescription) {
            const dataPsmSetHumanDescription = new DataPsmSetHumanDescription();
            dataPsmSetHumanDescription.dataPsmResource = this.dataPsmSchemaIri;
            dataPsmSetHumanDescription.dataPsmHumanDescription = this.schemaHumanDescription;
            await this.store.applyOperation(this.dataPsmSchemaIri, dataPsmSetHumanDescription);
        }
    }
}
