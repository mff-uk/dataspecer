import { SemanticModelClass, SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";
import { DataPsmClass } from "@dataspecer/core/data-psm/model";
import { DataPsmCreateClass, DataPsmCreateInclude, DataPsmSetChoice, DataPsmWrapWithOr } from "@dataspecer/core/data-psm/operation";
import { ComplexOperation } from "@dataspecer/federated-observable-store/complex-operation";
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { TechnicalLabelOperationContext } from "./context/technical-label-operation-context";
import { extendPimClassesAlongInheritance } from "./helper/extend-pim-classes-along-inheritance";

/**
 * Operation that modifies the PSM tree in such way that the provided PIM class
 * specializes existing PSM class. If the class is already part of OR, the new
 * class is only added as another choice. Otherwise, new OR is created.
 *
 * todo: wrappedOrIri needs to be provided
 */
export class AddSpecialization implements ComplexOperation {
  private readonly forDataPsmClassIri: string;
  private readonly wrappedOrIri?: string;
  private readonly sourceClassId: string;
  private readonly sourceStore: SemanticModelEntity[];

  private store!: FederatedObservableStore;
  private context: TechnicalLabelOperationContext|null = null;

  constructor(forDataPsmClassIri: string, wrappedOrIri: string|undefined, sourceClassId: string, sourceStore: SemanticModelEntity[]) {
    this.forDataPsmClassIri = forDataPsmClassIri;
    this.wrappedOrIri = wrappedOrIri;
    this.sourceClassId = sourceClassId;
    this.sourceStore = sourceStore;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  setContext(context: TechnicalLabelOperationContext) {
    this.context = context;
  }

  async execute(): Promise<void> {
    const dataPsmSchema = this.store.getSchemaForResource(this.forDataPsmClassIri) as string;
    const forDataPsmClass = await this.store.readResource(this.forDataPsmClassIri) as DataPsmClass;
    const interpretedPimClass = await this.store.readResource(forDataPsmClass.dataPsmInterpretation as string) as SemanticModelClass;
    const pimSchemaIri = this.store.getSchemaForResource(interpretedPimClass.iri as string) as string;

    // FIRST: Get wrapping *OR* or create it

    let wrapOr: string | undefined = this.wrappedOrIri;
    if (wrapOr === undefined) {
      const wrapWithOrOperation = new DataPsmWrapWithOr();
      wrapWithOrOperation.dataPsmChild = this.forDataPsmClassIri;
      const result = await this.store.applyOperation(dataPsmSchema, wrapWithOrOperation);
      wrapOr = result.created[0];
    }

    // SECOND: Create all PIM classes

    const sourceFromPimClass = this.sourceStore.find(e => e.id === interpretedPimClass.iri) as SemanticModelClass;
    const sourceToPimClass = this.sourceStore.find(e => e.id === this.sourceClassId) as SemanticModelClass;

    const result = await extendPimClassesAlongInheritance(
      sourceToPimClass,
      sourceFromPimClass,
      pimSchemaIri,
      this.store,
      this.sourceStore
    );
    if (!result) {
      throw new Error("Could not extend PIM classes along inheritance.");
    }

    // THIRD: Add PSM class

    const toPimClassIri = await this.store.getPimHavingInterpretation(sourceToPimClass.id as string, "", pimSchemaIri);
    const toPimClass = await this.store.readResource(toPimClassIri as string) as SemanticModelClass;

    const dataPsmCreateClass = new DataPsmCreateClass();
    dataPsmCreateClass.dataPsmInterpretation = toPimClassIri;
    dataPsmCreateClass.dataPsmTechnicalLabel = this.context?.getTechnicalLabelFromPim(toPimClass.name) ?? null;
    const dataPsmCreateClassResult = await this.store.applyOperation(dataPsmSchema, dataPsmCreateClass);
    const createdPsmClass = dataPsmCreateClassResult.created[0];

    // FOURTH: Add to OR

    const addToOr = new DataPsmSetChoice();
    addToOr.dataPsmOr = wrapOr;
    addToOr.dataPsmChoice = createdPsmClass;
    await this.store.applyOperation(dataPsmSchema, addToOr);

    // FIFTH: Add include

    const addInclude = new DataPsmCreateInclude();
    addInclude.dataPsmOwner = createdPsmClass;
    addInclude.dataPsmIncludes = this.forDataPsmClassIri;
    await this.store.applyOperation(dataPsmSchema, addInclude);
  }
}
