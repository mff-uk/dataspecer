import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { DataPsmCreateClass, DataPsmSetChoice } from "@dataspecer/core/data-psm/operation";
import { ComplexOperation } from "@dataspecer/federated-observable-store/complex-operation";
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { L0Aggregator } from "../semantic-aggregator/interfaces";
import { TechnicalLabelOperationContext } from "./context/technical-label-operation-context";

/**
 * Adds new class to the OR and tries to create inheritance chain to PIM.
 */
export class CreateNewClassInOr implements ComplexOperation {
  private store!: FederatedObservableStore;
  private readonly dataPsmOrIri: string;
  private readonly semanticClassId: string;
  private context: TechnicalLabelOperationContext | null = null;
  private semanticStore!: L0Aggregator;

  constructor(dataPsmOrIri: string, semanticClassId: string) {
    this.dataPsmOrIri = dataPsmOrIri;
    this.semanticClassId = semanticClassId;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  setSemanticStore(semanticStore: L0Aggregator) {
    this.semanticStore = semanticStore;
  }

  setContext(context: TechnicalLabelOperationContext) {
    this.context = context;
  }

  async execute(): Promise<void> {
    const dataPsmSchema = this.store.getSchemaForResource(this.dataPsmOrIri) as string;
    const semanticClass = this.semanticStore.getLocalEntity(this.semanticClassId).aggregatedEntity as SemanticModelClass;

    // Create data psm class

    const dataPsmCreateClass = new DataPsmCreateClass();
    dataPsmCreateClass.dataPsmInterpretation = semanticClass.id;
    dataPsmCreateClass.dataPsmTechnicalLabel = this.context?.getTechnicalLabelFromPim(semanticClass.name) ?? null;
    const dataPsmCreateClassResult = await this.store.applyOperation(dataPsmSchema, dataPsmCreateClass);
    const psmClass = dataPsmCreateClassResult.created[0];

    const dataPsmSetChoice = new DataPsmSetChoice();
    dataPsmSetChoice.dataPsmOr = this.dataPsmOrIri;
    dataPsmSetChoice.dataPsmChoice = psmClass;
    await this.store.applyOperation(dataPsmSchema, dataPsmSetChoice);
  }
}
