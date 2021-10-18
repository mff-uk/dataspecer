import {CoreResource, CoreOperation, LanguageString} from "../../core";

export class PimSetHumanLabel extends CoreOperation {

  static readonly TYPE = "pim-action-set-human-label";

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
