import {CoreResource, CoreOperation} from "../../core";

export class PimSetTechnicalLabel extends CoreOperation {

  static readonly TYPE = "psm-action-update-technical-label";

  pimResource: string | null = null;

  pimTechnicalLabel: string | null = null;

  constructor() {
    super();
    this.types.push(PimSetTechnicalLabel.TYPE);
  }

  static is(resource: CoreResource | null)
    : resource is PimSetTechnicalLabel {
    return resource?.types.includes(PimSetTechnicalLabel.TYPE);
  }

}
