import { SemanticModelClass, SemanticModelEntity, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { ASSOCIATION_END } from "@dataspecer/core/data-psm/data-psm-vocabulary";
import { DataPsmAssociationEnd } from "@dataspecer/core/data-psm/model";
import { DataPsmCreateClass, DataPsmSetChoice } from "@dataspecer/core/data-psm/operation";
import { ComplexOperation } from "@dataspecer/federated-observable-store/complex-operation";
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { TechnicalLabelOperationContext } from "./context/technical-label-operation-context";
import { extendPimClassesAlongInheritance } from "./helper/extend-pim-classes-along-inheritance";
import { createPimClassIfMissing } from "./helper/pim";

/**
 * Adds new class to the OR and tries to create inheritance chain to PIM.
 */
export class CreateNewClassInOr implements ComplexOperation {
  private store!: FederatedObservableStore;
  private readonly dataPsmOrIri: string;
  private readonly semanticClassId: string;
  private readonly sourceSemanticModel: SemanticModelEntity[];
  private context: TechnicalLabelOperationContext|null = null;
  private pimSchema: string | null;

  constructor(dataPsmOrIri: string, semanticClassId: string, sourceSemanticModel: SemanticModelEntity[], pimSchema: string|null = null) {
    this.dataPsmOrIri = dataPsmOrIri;
    this.semanticClassId = semanticClassId;
    this.sourceSemanticModel = sourceSemanticModel;
    this.pimSchema = pimSchema;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  setContext(context: TechnicalLabelOperationContext) {
    this.context = context;
  }

  async execute(): Promise<void> {
    const dataPsmSchema = this.store.getSchemaForResource(this.dataPsmOrIri) as string;

    // Find parent object to get the type

    const resources = await this.store.listResourcesOfType(ASSOCIATION_END);
    let parentAssociation: string = "";
    for (const resourceIri of resources) {
      const resource = await this.store.readResource(resourceIri) as DataPsmAssociationEnd;
      if (resource.dataPsmPart === this.dataPsmOrIri) {
        parentAssociation = resourceIri;
      }
    }

    const desiredSemanticClass = this.sourceSemanticModel.find((entity) => entity.id === this.semanticClassId) as SemanticModelClass;

    let pimSchema: string | null = null;
    if (parentAssociation) {
      const dataPsmAssociationEnd = await this.store.readResource(parentAssociation) as DataPsmAssociationEnd;
      const semanticModelRelationship = await this.store.readResource(dataPsmAssociationEnd.dataPsmInterpretation as string) as SemanticModelRelationship;
      const end = semanticModelRelationship.ends[1]; // todo: find correct end
      const typedPimClass = await this.store.readResource(end.concept as string) as SemanticModelClass;
      pimSchema = this.store.getSchemaForResource(typedPimClass.id as string) as string;


      const sourceSemanticClass = this.sourceSemanticModel.find((entity) => entity.id === typedPimClass.iri) as SemanticModelClass;
      await extendPimClassesAlongInheritance(
        sourceSemanticClass, desiredSemanticClass, pimSchema, this.store, this.sourceSemanticModel);
    }

    const pimClass = await createPimClassIfMissing(desiredSemanticClass, pimSchema ?? this.pimSchema as string, this.store);

    // Create data psm class

    const dataPsmCreateClass = new DataPsmCreateClass();
    dataPsmCreateClass.dataPsmInterpretation = pimClass;
    dataPsmCreateClass.dataPsmTechnicalLabel = this.context?.getTechnicalLabelFromPim((await this.store.readResource(pimClass) as SemanticModelClass).name) ?? null;
    const dataPsmCreateClassResult = await this.store.applyOperation(dataPsmSchema, dataPsmCreateClass);
    const psmClass = dataPsmCreateClassResult.created[0];

    const dataPsmSetChoice = new DataPsmSetChoice();
    dataPsmSetChoice.dataPsmOr = this.dataPsmOrIri;
    dataPsmSetChoice.dataPsmChoice = psmClass;
    await this.store.applyOperation(dataPsmSchema, dataPsmSetChoice);
  }
}
