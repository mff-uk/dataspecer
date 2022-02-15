import { CoreResource, CoreOperation, LanguageString } from "../../core";
import * as PIM from "../pim-vocabulary";

export class PimSetHumanLabel extends CoreOperation {
  static readonly TYPE = PIM.SET_HUMAN_LABEL;

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
