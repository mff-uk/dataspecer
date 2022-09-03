import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {DataPsmClass} from "@dataspecer/core/data-psm/model";
import {CoreResourceReader} from "@dataspecer/core/core";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";
import {TechnicalLabelOperationContext} from "./context/technical-label-operation-context";
import {DataPsmCreateClass, DataPsmCreateInclude, DataPsmSetChoice, DataPsmWrapWithOr} from "@dataspecer/core/data-psm/operation";
import {getPimHavingInterpretation} from "../utils/get-pim-having-interpretation";
import {PimClass} from "@dataspecer/core/pim/model";
import {extendPimClassesAlongInheritance} from "./helper/extend-pim-classes-along-inheritance";

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
  private readonly newPimClassIri: string;
  private readonly pimClassStore: CoreResourceReader;

  private store!: FederatedObservableStore;
  private context: TechnicalLabelOperationContext|null = null;

  constructor(forDataPsmClassIri: string, wrappedOrIri: string|undefined, newPimClassIri: string, pimClassStore: CoreResourceReader) {
    this.forDataPsmClassIri = forDataPsmClassIri;
    this.wrappedOrIri = wrappedOrIri;
    this.newPimClassIri = newPimClassIri;
    this.pimClassStore = pimClassStore;
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
    const interpretedPimClass = await this.store.readResource(forDataPsmClass.dataPsmInterpretation as string) as PimClass;
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

    const sourceFromPimClassIri = await getPimHavingInterpretation(this.pimClassStore, interpretedPimClass.pimInterpretation as string) as string;

    const sourceFromPimClass = await this.pimClassStore.readResource(sourceFromPimClassIri) as PimClass;
    const sourceToPimClass = await this.pimClassStore.readResource(this.newPimClassIri) as PimClass;

    const result = await extendPimClassesAlongInheritance(
      sourceToPimClass,
      sourceFromPimClass,
      pimSchemaIri,
      this.store,
      this.pimClassStore
    );
    if (!result) {
      throw new Error("Could not extend PIM classes along inheritance.");
    }

    // THIRD: Add PSM class

    const toPimClassIri = await this.store.getPimHavingInterpretation(sourceToPimClass.pimInterpretation as string, pimSchemaIri);
    const toPimClass = await this.store.readResource(toPimClassIri as string) as PimClass;

    const dataPsmCreateClass = new DataPsmCreateClass();
    dataPsmCreateClass.dataPsmInterpretation = toPimClassIri;
    dataPsmCreateClass.dataPsmTechnicalLabel = this.context?.getTechnicalLabelFromPim(toPimClass) ?? null;
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
