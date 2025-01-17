import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { DataPsmCreateAssociationEnd, DataPsmCreateClass } from "@dataspecer/core/data-psm/operation";
import { ComplexOperation } from "@dataspecer/federated-observable-store/complex-operation";
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { TechnicalLabelOperationContext } from "./context/technical-label-operation-context";
import { createPimClassIfMissing } from "./helper/pim";

/**
 * Adds association to the same class. The association will not have any interpretation.
 */
export class CreateNonInterpretedAssociationToClass implements ComplexOperation {
  private readonly ownerClass: string;
  /**
   * If this is set, the association will be created to interpreted class
   */
  private readonly sourceClass?: SemanticModelClass;
  private readonly pimSchemaIri?: string;
  private store!: FederatedObservableStore;
  private context: TechnicalLabelOperationContext | null = null;

  constructor(ownerClass: string, sourceClass?: SemanticModelClass, pimSchemaIri?: string) {
    this.ownerClass = ownerClass;
    this.sourceClass = sourceClass;
    this.pimSchemaIri = pimSchemaIri;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  setContext(context: TechnicalLabelOperationContext) {
    this.context = context;
  }

  async execute(): Promise<void> {
    const schema = this.store.getSchemaForResource(this.ownerClass) as string;

    // Whether we have a semantic source or not
    const isInterpreted = !!this.sourceClass;

    const dataPsmCreateClass = new DataPsmCreateClass();

    if (isInterpreted) {
      const pimClassIri = await createPimClassIfMissing(this.sourceClass, this.pimSchemaIri, this.store);
      dataPsmCreateClass.dataPsmInterpretation = pimClassIri;
      dataPsmCreateClass.dataPsmTechnicalLabel =
        this.context?.getTechnicalLabelFromPim(
          ((await this.store.readResource(pimClassIri)) as SemanticModelClass).name
        ) ?? null;
    } else {
      dataPsmCreateClass.dataPsmInterpretation = null;
      dataPsmCreateClass.dataPsmTechnicalLabel = "class";
    }

    const dataPsmCreateClassResult = await this.store.applyOperation(schema, dataPsmCreateClass);
    const psmClassIri = dataPsmCreateClassResult.created[0];

    const association = new DataPsmCreateAssociationEnd();
    association.dataPsmInterpretation = null;
    association.dataPsmTechnicalLabel = "association";
    association.dataPsmOwner = this.ownerClass;
    association.dataPsmPart = psmClassIri;
    await this.store.applyOperation(schema, association);
  }
}
