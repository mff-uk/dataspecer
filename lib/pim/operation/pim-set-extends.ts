import {CoreResource, CoreOperation} from "../../core";
import * as PIM from "../pim-vocabulary";

export class PimSetExtends extends CoreOperation {

  static readonly TYPE = PIM.SET_EXTENDS;

  pimResource: string | null = null;

  pimExtends: string[] = [];

  constructor() {
    super();
    this.types.push(PimSetExtends.TYPE);
  }

  static is(resource: CoreResource | null)
    : resource is PimSetExtends {
    return resource?.types.includes(PimSetExtends.TYPE);
  }

}
