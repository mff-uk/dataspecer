import {DataPsmUnsetChoice} from "@dataspecer/core/data-psm/operation";
import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";
import {DataPsmClass, DataPsmInclude, DataPsmOr} from "@dataspecer/core/data-psm/model";

/**
 * For a given Data PSM OR that meets conditions to be an inheritance OR, it
 * removes one of its choices (objects) and all other in the include chain.
 */
export class DeleteInheritanceOrSpecialization implements ComplexOperation {
  private readonly ownerOrIri: string;
  private readonly classIriToDelete: string;
  private store!: FederatedObservableStore;

  constructor(ownerOrIri: string, classIriToDelete: string) {
    this.ownerOrIri = ownerOrIri;
    this.classIriToDelete = classIriToDelete;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  async execute(): Promise<void> {
    const schema = this.store.getSchemaForResource(this.ownerOrIri) as string;

    // choice IRI to included iri
    const choiceCache: Record<string, string> = {};

    const or = await this.store.readResource(this.ownerOrIri) as DataPsmOr;
    for (const choiceIri of or.dataPsmChoices) {
      const choice = await this.store.readResource(choiceIri);
      if (!choice || !DataPsmClass.is(choice)) {
        throw new Error("Invalid OR structure");
      }
      const firstItemIri = choice.dataPsmParts[0];
      if (!firstItemIri) {
        throw new Error("Invalid OR structure");
      }
      const firstItem = await this.store.readResource(firstItemIri);
      if (!firstItem || !DataPsmInclude.is(firstItem)) {
        throw new Error("Invalid OR structure");
      }

      choiceCache[choiceIri as string] = firstItem.dataPsmIncludes as string;
    }

    const choicesToDelete = [this.classIriToDelete];

    // Go through choiceCache and fill choicesToDelete
    for (let toProcess = 0; toProcess < choicesToDelete.length; toProcess++) {
      const processedChoiceIri = choicesToDelete[toProcess];
      for (const key in choiceCache) {
        if (choiceCache[key] === processedChoiceIri && !choicesToDelete.includes(key)) {
          choicesToDelete.push(key);
        }
      }
    }

    // Delete the choices
    for (const choiceToDelete of choicesToDelete) {
      const dataPsmUnsetChoice = new DataPsmUnsetChoice();
      dataPsmUnsetChoice.dataPsmOr = this.ownerOrIri;
      dataPsmUnsetChoice.dataPsmChoice = choiceToDelete;
      await this.store.applyOperation(schema, dataPsmUnsetChoice);
    }
  }
}
