
import { ExtendedSemanticModelRelationshipEnd, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { modifyRelation } from "@dataspecer/core-v2/semantic-model/operations";
import { ComplexOperation } from "@dataspecer/federated-observable-store/complex-operation";
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";

export class SetPimDatatype implements ComplexOperation {
  private readonly forPimAttributeIri: string;
  private readonly datatype: string | null;
  private readonly requiredLanguages: string[];
  private store!: FederatedObservableStore;

  constructor(forPimAttributeIri: string, datatype: string | null, requiredLanguages: string[] = []) {
    this.forPimAttributeIri = forPimAttributeIri;
    this.datatype = datatype;
    this.requiredLanguages = requiredLanguages;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  async execute(): Promise<void> {
    const schema = this.store.getSchemaForResource(this.forPimAttributeIri) as string;

    let datatype = this.datatype;
    if (datatype === "") {
      console.warn("SetPimDatatype ComplexOperation: Datatype should not be an empty string. Setting it to null.");
      datatype = null;
    }

    const relation = await this.store.readResource(this.forPimAttributeIri) as SemanticModelRelationship;

    const languagesToSet = (datatype === "https://ofn.gov.cz/zdroj/základní-datové-typy/2020-07-01/text") ? [...new Set(this.requiredLanguages)] : [];

    const operation = modifyRelation(this.forPimAttributeIri, {
      ...relation,
      ends: [
        relation.ends[0],
        {
          ...relation.ends[1],
          concept: datatype,
          languageStringRequiredLanguages: languagesToSet,
        } as ExtendedSemanticModelRelationshipEnd
      ]
    });

    // @ts-ignore
    await this.store.applyOperation(schema, operation);
  }
}
