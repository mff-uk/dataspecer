import { CoreOperation, CoreResource } from "../../core";
import * as PIM from "../pim-vocabulary";

export class PimSetCardinality extends CoreOperation {
  static readonly TYPE = PIM.SET_CARDINALITY;

  pimResource: string | null = null;

  pimCardinalityMin: number | null = null;

  pimCardinalityMax: number | null = null;

  constructor() {
    super();
    this.types.push(PimSetCardinality.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimSetCardinality {
    return resource?.types.includes(PimSetCardinality.TYPE);
  }
}
