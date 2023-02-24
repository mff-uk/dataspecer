import { CoreOperation, CoreResource } from "../../core";
import * as PIM from "../pim-vocabulary";

export class PimSetRegex extends CoreOperation {
  static readonly TYPE = PIM.SET_REGEX;

  pimAttribute: string | null = null;

  pimRegex: string | null = null;

  constructor() {
    super();
    this.types.push(PimSetRegex.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimSetRegex {
    return resource?.types.includes(PimSetRegex.TYPE);
  }
}
