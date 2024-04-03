import {PimSetDatatype} from "@dataspecer/core/pim/operation";
import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";

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

    const pimSetDatatype = new PimSetDatatype();
    pimSetDatatype.pimAttribute = this.forPimAttributeIri;
    pimSetDatatype.pimDatatype = datatype;
    if (datatype === "https://ofn.gov.cz/zdroj/základní-datové-typy/2020-07-01/text") {
      pimSetDatatype.pimLanguageStringRequiredLanguages = [...new Set(this.requiredLanguages)];
    }
    await this.store.applyOperation(schema, pimSetDatatype);
  }
}
