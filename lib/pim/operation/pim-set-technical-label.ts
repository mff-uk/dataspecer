import {CoreResource, CoreOperation} from "../../core";
import * as PIM from "../pim-vocabulary";

export class PimSetTechnicalLabel extends CoreOperation {

  static readonly TYPE = PIM.SET_TECHNICAL_LABEL;

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
