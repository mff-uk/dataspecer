import { CoreOperation, CoreResource } from "../../core/index.ts";
import * as PIM from "../pim-vocabulary.ts";

export class PimSetRegex extends CoreOperation {
  static readonly TYPE = PIM.SET_REGEX;

  pimResource: string | null = null;

  pimRegex: string | null = null;

  constructor() {
    super();
    this.types.push(PimSetRegex.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimSetRegex {
    return resource?.types.includes(PimSetRegex.TYPE);
  }
}
