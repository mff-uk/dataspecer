import { CoreResource, CoreOperation } from "../../core";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmDeleteInclude extends CoreOperation {
  static readonly TYPE = PSM.DELETE_INCLUDE;

  dataPsmOwner: string | null = null;

  dataPsmInclude: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmDeleteInclude.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmDeleteInclude {
    return resource?.types.includes(DataPsmDeleteInclude.TYPE);
  }
}
