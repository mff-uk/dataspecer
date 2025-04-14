import { CoreOperation, CoreResource } from "../../core/index.ts";
import * as PIM from "../pim-vocabulary.ts";

export class PimSetObjectExample extends CoreOperation {
  static readonly TYPE = PIM.SET_OBJECT_EXAMPLE;

  pimResource: string | null = null;

  /**
   * New examples set.
   */
  pimObjectExample: object[] | null = null;

  constructor() {
    super();
    this.types.push(PimSetObjectExample.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimSetObjectExample {
    return resource?.types.includes(PimSetObjectExample.TYPE);
  }
}
