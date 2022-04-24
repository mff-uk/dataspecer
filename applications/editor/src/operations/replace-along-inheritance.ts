import {DataPsmClass} from "@dataspecer/core/data-psm/model";
import {CoreResourceReader} from "@dataspecer/core/core";
import {PimClass} from "@dataspecer/core/pim/model";
import {DataPsmCreateClass, DataPsmDeleteClass, DataPsmReplaceAlongInheritance} from "@dataspecer/core/data-psm/operation";
import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {isPimAncestorOf} from "../utils/is-ancestor-of";
import {getPimHavingInterpretation} from "../utils/get-pim-having-interpretation";
import {extendPimClassesAlongInheritance} from "./helper/extend-pim-classes-along-inheritance";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";
import {TechnicalLabelOperationContext} from "./context/technical-label-operation-context";

/**
 * Replaces an existing DataPSM class with a new one that interprets given CIM
 * iri. The replaced class needs to be a subclass or superclass of the class to
 * be replaced.
 */
export class ReplaceAlongInheritance implements ComplexOperation {
    private readonly fromDataPsmClassIri: string;
    private readonly toPimClassIri: string;
    private readonly sourcePimModel: CoreResourceReader;
    private store!: FederatedObservableStore;
    private context: TechnicalLabelOperationContext|null = null;

    /**
     * @param fromDataPsmClassIri Class IRI from the local store that is to be replaced and removed.
     * @param toPimClassIri Class IRI from the {@link sourcePimModel} that is to be used as replacement.
     * @param sourcePimModel The PIM model that contains the replacement class and full inheritance hierarchy.
     */
    constructor(
      fromDataPsmClassIri: string,
      toPimClassIri: string,
      sourcePimModel: CoreResourceReader,
      ) {
        this.fromDataPsmClassIri = fromDataPsmClassIri;
        this.toPimClassIri = toPimClassIri;
        this.sourcePimModel = sourcePimModel;
    }

    setStore(store: FederatedObservableStore) {
        this.store = store;
    }

    setContext(context: TechnicalLabelOperationContext) {
        this.context = context;
    }

    async execute(): Promise<void> {
        const fromDataPsmClass = await this.store.readResource(this.fromDataPsmClassIri) as DataPsmClass;
        const fromPimClass = await this.store.readResource(fromDataPsmClass.dataPsmInterpretation as string) as PimClass;
        const dataPsmSchemaIri = this.store.getSchemaForResource(fromDataPsmClass.iri as string) as string;

        const sourceFromPimClassIri = await getPimHavingInterpretation(this.sourcePimModel, fromPimClass.pimInterpretation as string) as string;

        // Create all PIM classes
        const isSpecialization = await isPimAncestorOf(
          this.sourcePimModel,
          sourceFromPimClassIri,
          this.toPimClassIri
        );


        const sourceFromPimClass = await this.sourcePimModel.readResource(sourceFromPimClassIri) as PimClass;
        const sourceToPimClass = await this.sourcePimModel.readResource(this.toPimClassIri) as PimClass; //vec
        const pimSchemaIri = this.store.getSchemaForResource(fromPimClass.iri as string) as string;

        const result = await extendPimClassesAlongInheritance(
            !isSpecialization ? sourceFromPimClass : sourceToPimClass,
            isSpecialization ? sourceFromPimClass : sourceToPimClass,
            pimSchemaIri,
            this.store,
            this.sourcePimModel
        );
        if (!result) {
            throw new Error("Could not extend PIM classes along inheritance.");
        }


        // Create data PSM class

        const toPimClassIri = await this.store.getPimHavingInterpretation(sourceToPimClass.pimInterpretation as string, pimSchemaIri);
        const toPimClass = await this.store.readResource(toPimClassIri as string) as PimClass;

        const dataPsmCreateClass = new DataPsmCreateClass();
        dataPsmCreateClass.dataPsmInterpretation = toPimClassIri;
        dataPsmCreateClass.dataPsmTechnicalLabel = this.context?.getTechnicalLabelFromPim(toPimClass) ?? null;
        const dataPsmCreateClassResult = await this.store.applyOperation(dataPsmSchemaIri, dataPsmCreateClass);
        const toPsmClassIri = dataPsmCreateClassResult.created[0];

        // Replace data psm classes

        const dataPsmReplaceAlongInheritance = new DataPsmReplaceAlongInheritance();
        dataPsmReplaceAlongInheritance.dataPsmOriginalClass = fromDataPsmClass.iri;
        dataPsmReplaceAlongInheritance.dataPsmReplacingClass = toPsmClassIri;
        await this.store.applyOperation(dataPsmSchemaIri, dataPsmReplaceAlongInheritance);

        // Remove the old class

        const dataPsmDeleteClass = new DataPsmDeleteClass();
        dataPsmDeleteClass.dataPsmClass = fromDataPsmClass.iri;
        await this.store.applyOperation(dataPsmSchemaIri, dataPsmDeleteClass);
    }
}
