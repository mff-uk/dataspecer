import { SemanticModelClass } from '@dataspecer/core-v2/semantic-model/concepts';
import {DataPsmCreateClass, DataPsmSetHumanDescription, DataPsmSetHumanLabel, DataPsmSetRoots} from "@dataspecer/core/data-psm/operation";
import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {createPimClassIfMissing} from "./helper/pim";
import {LanguageString} from "@dataspecer/core/core";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";
import {TechnicalLabelOperationContext} from "./context/technical-label-operation-context";

/**
 * For the given pimClass, it creates a new schema and new PIM and DataPSM classes representing the given class.
 *
 * It is expected that the store already contains a schema.
 *
 * Schema roots are overwritten, but the class tree is not removed. This operation expects empty store having only a
 * schema.
 */
export class CreateRootClass implements ComplexOperation {
    private readonly sourceClass: SemanticModelClass;
    private readonly pimSchemaIri: string;
    private readonly dataPsmSchemaIri: string;
    private readonly schemaHumanLabel?: LanguageString;
    private readonly schemaHumanDescription?: LanguageString;
    private store!: FederatedObservableStore;
    private context: TechnicalLabelOperationContext|null = null;

    constructor(sourceClass: SemanticModelClass, pimSchemaIri: string, dataPsmSchemaIri: string, schemaHumanLabel?: LanguageString, schemaHumanDescription?: LanguageString) {
        this.sourceClass = sourceClass;
        this.pimSchemaIri = pimSchemaIri;
        this.dataPsmSchemaIri = dataPsmSchemaIri;
        this.schemaHumanLabel = schemaHumanLabel;
        this.schemaHumanDescription = schemaHumanDescription;
    }

    setStore(store: FederatedObservableStore) {
        this.store = store;
    }

    setContext(context: TechnicalLabelOperationContext) {
        this.context = context;
    }

    async execute(): Promise<void> {
        const pimClassIri = await createPimClassIfMissing(this.sourceClass, this.pimSchemaIri, this.store);

        const dataPsmCreateClass = new DataPsmCreateClass();
        dataPsmCreateClass.dataPsmInterpretation = pimClassIri;
        dataPsmCreateClass.dataPsmTechnicalLabel = this.context?.getTechnicalLabelFromPim((await this.store.readResource(pimClassIri) as SemanticModelClass).name) ?? null;
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
