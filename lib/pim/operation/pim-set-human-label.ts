import {CoreResource, CoreOperation, LanguageString} from "../../core";

export class PimSetHumanLabel extends CoreOperation {

  static readonly TYPE = "psm-action-update-human-label";

  pimResource: string | null = null;

  pimHumanLabel: LanguageString | null = null;

  constructor() {
    super();
    this.types.push(PimSetHumanLabel.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimSetHumanLabel {
    return resource?.types.includes(PimSetHumanLabel.TYPE);
  }

}
