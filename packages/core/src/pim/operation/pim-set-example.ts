import { CoreOperation, CoreResource } from "../../core/index.ts";
import * as PIM from "../pim-vocabulary.ts";

export class PimSetExample extends CoreOperation {
  static readonly TYPE = PIM.SET_EXAMPLE;

  pimResource: string | null = null;

  /**
   * New examples set.
   * @todo Is this granular enough?
   */
  pimExample: string[] | null = null;

  constructor() {
    super();
    this.types.push(PimSetExample.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimSetExample {
    return resource?.types.includes(PimSetExample.TYPE);
  }
}
