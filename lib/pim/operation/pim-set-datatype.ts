import {CoreOperation, CoreResource} from "../../core";

export class PimSetDatatype extends CoreOperation {

  static readonly TYPE = "pim-action-set-datatype";

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
