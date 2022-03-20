import {LanguageString} from "@model-driven-data/core/core";
import {DataPsmSetHumanDescription, DataPsmSetHumanLabel} from "@model-driven-data/core/data-psm/operation";
import {ComplexOperation} from "@model-driven-data/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@model-driven-data/federated-observable-store/federated-observable-store";

export class SetDataPsmLabelAndDescription implements ComplexOperation {
  private readonly forDataPsmResourceIri: string;
  private readonly dataPsmHumanLabel: LanguageString;
  private readonly dataPsmHumanDescription: LanguageString;
  private store!: FederatedObservableStore;

  constructor(forDataPsmResourceIri: string, dataPsmHumanLabel: LanguageString, dataPsmHumanDescription: LanguageString) {
    this.forDataPsmResourceIri = forDataPsmResourceIri;
    this.dataPsmHumanLabel = dataPsmHumanLabel;
    this.dataPsmHumanDescription = dataPsmHumanDescription;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  async execute(): Promise<void> {
    const schema = this.store.getSchemaForResource(this.forDataPsmResourceIri) as string;

    const dataPsmSetHumanLabel = new DataPsmSetHumanLabel();
    dataPsmSetHumanLabel.dataPsmResource = this.forDataPsmResourceIri;
    dataPsmSetHumanLabel.dataPsmHumanLabel = this.dataPsmHumanLabel;
    await this.store.applyOperation(schema, dataPsmSetHumanLabel);

    const dataPsmSetHumanDescription = new DataPsmSetHumanDescription();
    dataPsmSetHumanDescription.dataPsmResource = this.forDataPsmResourceIri;
    dataPsmSetHumanDescription.dataPsmHumanDescription = this.dataPsmHumanDescription;
    await this.store.applyOperation(schema, dataPsmSetHumanDescription);
  }
}
