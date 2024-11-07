import { ExtendedSemanticModelClass, SemanticModelClass, SemanticModelEntity } from '@dataspecer/core-v2/semantic-model/concepts';
import { DataPsmClass } from "@dataspecer/core/data-psm/model";
import { DataPsmCreateClass, DataPsmDeleteClass, DataPsmReplaceAlongInheritance } from "@dataspecer/core/data-psm/operation";
import { ComplexOperation } from "@dataspecer/federated-observable-store/complex-operation";
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { isAncestorOf } from "../utils/is-ancestor-of";
import { TechnicalLabelOperationContext } from "./context/technical-label-operation-context";
import { extendPimClassesAlongInheritance } from "./helper/extend-pim-classes-along-inheritance";

/**
 * Replaces an existing DataPSM class with a new one that interprets given CIM
 * iri. The replaced class needs to be a subclass or superclass of the class to
 * be replaced.
 */
export class ReplaceAlongInheritance implements ComplexOperation {
    private readonly fromDataPsmClassIri: string;
    private readonly toSemanticClassId: string;
    private readonly sourceSemanticModel: SemanticModelEntity[];
    private store!: FederatedObservableStore;
    private context: TechnicalLabelOperationContext|null = null;

    /**
     * @param fromDataPsmClassIri Class IRI from the local store that is to be replaced and removed.
     * @param toSemanticClassId Class IRI from the {@link sourceSemanticModel} that is to be used as replacement.
     * @param sourceSemanticModel The PIM model that contains the replacement class and full inheritance hierarchy.
     */
    constructor(
      fromDataPsmClassIri: string,
      toSemanticClassId: string,
      sourceSemanticModel: SemanticModelEntity[],
      ) {
        this.fromDataPsmClassIri = fromDataPsmClassIri;
        this.toSemanticClassId = toSemanticClassId;
        this.sourceSemanticModel = sourceSemanticModel;
    }

    setStore(store: FederatedObservableStore) {
        this.store = store;
    }

    setContext(context: TechnicalLabelOperationContext) {
        this.context = context;
    }

    async execute(): Promise<void> {
        const fromDataPsmClass = await this.store.readResource(this.fromDataPsmClassIri) as DataPsmClass;
        const fromPimClass = await this.store.readResource(fromDataPsmClass.dataPsmInterpretation as string) as ExtendedSemanticModelClass;
        const dataPsmSchemaIri = this.store.getSchemaForResource(fromDataPsmClass.iri as string) as string;

        const sourceFromPimClassIri = fromPimClass.iri;

        // Create all PIM classes
        const isSpecialization = isAncestorOf(
          this.sourceSemanticModel,
          sourceFromPimClassIri,
          this.toSemanticClassId
        );


        const sourceFromPimClass = this.sourceSemanticModel.find(entity => entity.id === sourceFromPimClassIri) as SemanticModelClass;
        const sourceToPimClass = this.sourceSemanticModel.find(entity => entity.id === this.toSemanticClassId) as SemanticModelClass;
        const pimSchemaIri = this.store.getSchemaForResource(fromPimClass.iri as string) as string;

        const result = await extendPimClassesAlongInheritance(
            !isSpecialization ? sourceFromPimClass : sourceToPimClass,
            isSpecialization ? sourceFromPimClass : sourceToPimClass,
            pimSchemaIri,
            this.store,
            this.sourceSemanticModel
        );
        if (!result) {
            throw new Error("Could not extend PIM classes along inheritance.");
        }


        // Create data PSM class

        const toSemanticClassId = await this.store.getPimHavingInterpretation(sourceToPimClass.id as string, "", pimSchemaIri);
        const toPimClass = await this.store.readResource(toSemanticClassId as string) as ExtendedSemanticModelClass;

        const dataPsmCreateClass = new DataPsmCreateClass();
        dataPsmCreateClass.dataPsmInterpretation = toSemanticClassId;
        dataPsmCreateClass.dataPsmTechnicalLabel = this.context?.getTechnicalLabelFromPim(toPimClass.name) ?? null;
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
