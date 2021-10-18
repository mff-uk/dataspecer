import {CoreResource, CoreOperation} from "../../core";

export class DataPsmSetTechnicalLabel extends CoreOperation {

  static readonly TYPE = "data-psm-action-set-technical-label";

  dataPsmResource: string | null = null;

  dataPsmTechnicalLabel: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetTechnicalLabel.TYPE);
  }

  static is(
    resource: CoreResource | null,
  ): resource is DataPsmSetTechnicalLabel {
    return resource?.types.includes(DataPsmSetTechnicalLabel.TYPE);
  }

}
