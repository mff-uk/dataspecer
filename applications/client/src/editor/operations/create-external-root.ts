import {PimClass} from "@dataspecer/core/pim/model";
import {DataPsmCreateExternalRoot, DataPsmSetHumanDescription, DataPsmSetHumanLabel, DataPsmSetRoots} from "@dataspecer/core/data-psm/operation";
import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {createPimClassIfMissing} from "./helper/pim";
import {LanguageString} from "@dataspecer/core/core";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";
import {TechnicalLabelOperationContext} from "./context/technical-label-operation-context";

/**
 * For the given pimClass and given schema, it creates an external root
 */
export class CreateExternalRoot implements ComplexOperation {
    private readonly pimClass: PimClass;
    private readonly pimSchemaIri: string;
    private readonly dataPsmSchemaIri: string;
    private readonly schemaHumanLabel?: LanguageString;
    private readonly schemaHumanDescription?: LanguageString;
    private store!: FederatedObservableStore;
    private context: TechnicalLabelOperationContext|null = null;

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

    setContext(context: TechnicalLabelOperationContext) {
        this.context = context;
    }

    async execute(): Promise<void> {
        const pimClassIri = await createPimClassIfMissing(this.pimClass, this.pimSchemaIri, this.store);

        const dataPsmCreateExternalRoot = new DataPsmCreateExternalRoot();
        dataPsmCreateExternalRoot.dataPsmTypes = [pimClassIri];
        dataPsmCreateExternalRoot.dataPsmTechnicalLabel = this.context?.getTechnicalLabelFromPim(this.pimClass) ?? null;
        const dataPsmCreateExternalRootResult = await this.store.applyOperation(this.dataPsmSchemaIri, dataPsmCreateExternalRoot);

        const dataPsmUpdateSchemaRoots = new DataPsmSetRoots();
        dataPsmUpdateSchemaRoots.dataPsmRoots = [dataPsmCreateExternalRootResult.created[0]];
        await this.store.applyOperation(this.dataPsmSchemaIri, dataPsmUpdateSchemaRoots);
        //
        // // Schema label and description
        //
        // if (this.schemaHumanLabel) {
        //     const dataPsmSetHumanLabel = new DataPsmSetHumanLabel();
        //     dataPsmSetHumanLabel.dataPsmResource = this.dataPsmSchemaIri;
        //     dataPsmSetHumanLabel.dataPsmHumanLabel = this.schemaHumanLabel;
        //     await this.store.applyOperation(this.dataPsmSchemaIri, dataPsmSetHumanLabel);
        // }
        //
        // if (this.schemaHumanDescription) {
        //     const dataPsmSetHumanDescription = new DataPsmSetHumanDescription();
        //     dataPsmSetHumanDescription.dataPsmResource = this.dataPsmSchemaIri;
        //     dataPsmSetHumanDescription.dataPsmHumanDescription = this.schemaHumanDescription;
        //     await this.store.applyOperation(this.dataPsmSchemaIri, dataPsmSetHumanDescription);
        // }
    }
}
