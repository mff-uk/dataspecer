import {LanguageString} from "@dataspecer/core/core";
import {PimSetHumanDescription, PimSetHumanLabel} from "@dataspecer/core/pim/operation";
import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";

export class SetPimLabelAndDescription implements ComplexOperation {
  private readonly forPimResourceIri: string;
  private readonly pimHumanLabel: LanguageString;
  private readonly pimHumanDescription: LanguageString;
  private store!: FederatedObservableStore;

  constructor(forPimResourceIri: string, pimHumanLabel: LanguageString, pimHumanDescription: LanguageString) {
    this.forPimResourceIri = forPimResourceIri;
    this.pimHumanLabel = pimHumanLabel;
    this.pimHumanDescription = pimHumanDescription;
  }

  setStore(store: FederatedObservableStore): void {
    this.store = store;
  }

  async execute(): Promise<void> {
    const pimSetHumanLabel = new PimSetHumanLabel();
    pimSetHumanLabel.pimResource = this.forPimResourceIri;
    pimSetHumanLabel.pimHumanLabel = this.pimHumanLabel;
    await this.store.applyOperation(this.forPimResourceIri, pimSetHumanLabel);

    const pimSetHumanDescription = new PimSetHumanDescription();
    pimSetHumanDescription.pimResource = this.forPimResourceIri;
    pimSetHumanDescription.pimHumanDescription = this.pimHumanDescription;
    await this.store.applyOperation(this.forPimResourceIri, pimSetHumanDescription);
  }
}
