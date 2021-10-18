import {CoreResource, CoreOperation, LanguageString} from "../../core";

export class PimSetHumanDescription extends CoreOperation {

  static readonly TYPE = "pim-action-set-human-description";

  pimResource: string | null = null;

  pimHumanDescription: LanguageString | null = null;

  constructor() {
    super();
    this.types.push(PimSetHumanDescription.TYPE);
  }

  static is(resource: CoreResource | null)
    : resource is PimSetHumanDescription {
    return resource?.types.includes(PimSetHumanDescription.TYPE);
  }

}
