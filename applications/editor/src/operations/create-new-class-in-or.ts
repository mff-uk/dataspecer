import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";
import {CoreResourceReader} from "@dataspecer/core/core";
import {extendPimClassesAlongInheritance} from "./helper/extend-pim-classes-along-inheritance";
import {ASSOCIATION_END} from "@dataspecer/core/data-psm/data-psm-vocabulary";
import {DataPsmAssociationEnd} from "@dataspecer/core/data-psm/model";
import {PimAssociationEnd, PimClass} from "@dataspecer/core/pim/model";
import {DataPsmCreateClass, DataPsmSetChoice} from "@dataspecer/core/data-psm/operation";
import {createPimClassIfMissing} from "./helper/pim";
import {TechnicalLabelOperationContext} from "./context/technical-label-operation-context";

/**
 * Adds new class to the OR and tries to create inheritance chain to PIM.
 */
export class CreateNewClassInOr implements ComplexOperation {
  private store!: FederatedObservableStore;
  private readonly dataPsmOrIri: string;
  private readonly pimClassIri: string;
  private readonly pimClassStore: CoreResourceReader;
  private context: TechnicalLabelOperationContext|null = null;
  private pimSchema: string | null;

  constructor(dataPsmOrIri: string, pimClassIri: string, pimClassStore: CoreResourceReader, pimSchema: string|null = null) {
    this.dataPsmOrIri = dataPsmOrIri;
    this.pimClassIri = pimClassIri;
    this.pimClassStore = pimClassStore;
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

    const desiredPimClass = await this.pimClassStore.readResource(this.pimClassIri) as PimClass;

    let pimSchema: string | null = null;
    if (parentAssociation) {
      const dataPsmAssociationEnd = await this.store.readResource(parentAssociation) as DataPsmAssociationEnd;
      const pimAssociationEnd = await this.store.readResource(dataPsmAssociationEnd.dataPsmInterpretation as string) as PimAssociationEnd;
      const typedPimClass = await this.store.readResource(pimAssociationEnd.pimPart as string) as PimClass;
      pimSchema = this.store.getSchemaForResource(typedPimClass.iri as string) as string;


      await extendPimClassesAlongInheritance(
          typedPimClass, desiredPimClass, pimSchema, this.store, this.pimClassStore);
    }

    const pimClass = await createPimClassIfMissing(desiredPimClass, pimSchema ?? this.pimSchema as string, this.store);

    // Create data psm class

    const dataPsmCreateClass = new DataPsmCreateClass();
    dataPsmCreateClass.dataPsmInterpretation = pimClass;
    dataPsmCreateClass.dataPsmTechnicalLabel = this.context?.getTechnicalLabelFromPim(desiredPimClass) ?? null;
    const dataPsmCreateClassResult = await this.store.applyOperation(dataPsmSchema, dataPsmCreateClass);
    const psmClass = dataPsmCreateClassResult.created[0];

    const dataPsmSetChoice = new DataPsmSetChoice();
    dataPsmSetChoice.dataPsmOr = this.dataPsmOrIri;
    dataPsmSetChoice.dataPsmChoice = psmClass;
    await this.store.applyOperation(dataPsmSchema, dataPsmSetChoice);
  }
}
