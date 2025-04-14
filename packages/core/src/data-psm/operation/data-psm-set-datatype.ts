import { CoreOperation, CoreResource } from "../../core/index.ts";
import * as PSM from "../data-psm-vocabulary.ts";

export class DataPsmSetDatatype extends CoreOperation {
  static readonly TYPE = PSM.SET_DATATYPE;

  dataPsmAttribute: string | null = null;

  dataPsmDatatype: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetDatatype.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmSetDatatype {
    return resource?.types.includes(DataPsmSetDatatype.TYPE);
  }
}
