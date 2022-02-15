import { CoreResource, CoreOperation } from "../../core";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmSetTechnicalLabel extends CoreOperation {
  static readonly TYPE = PSM.SET_TECHNICAL_LABEL;

  dataPsmResource: string | null = null;

  dataPsmTechnicalLabel: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetTechnicalLabel.TYPE);
  }

  static is(
    resource: CoreResource | null
  ): resource is DataPsmSetTechnicalLabel {
    return resource?.types.includes(DataPsmSetTechnicalLabel.TYPE);
  }
}
