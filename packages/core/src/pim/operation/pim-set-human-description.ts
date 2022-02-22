import { CoreResource, CoreOperation, LanguageString } from "../../core";
import * as PIM from "../pim-vocabulary";

export class PimSetHumanDescription extends CoreOperation {
  static readonly TYPE = PIM.SET_HUMAN_DESCRIPTION;

  pimResource: string | null = null;

  pimHumanDescription: LanguageString | null = null;

  constructor() {
    super();
    this.types.push(PimSetHumanDescription.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimSetHumanDescription {
    return resource?.types.includes(PimSetHumanDescription.TYPE);
  }
}
