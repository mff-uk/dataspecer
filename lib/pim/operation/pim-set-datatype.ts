import {CoreOperation, CoreResource} from "../../core";
import * as PIM from "../pim-vocabulary";

export class PimSetDatatype extends CoreOperation {

  static readonly TYPE = PIM.SET_DATATYPE;

  pimAttribute: string | null = null;

  pimDatatype: string | null = null;

  constructor() {
    super();
    this.types.push(PimSetDatatype.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimSetDatatype {
    return resource?.types.includes(PimSetDatatype.TYPE);
  }

}
