import { CoreResource, CoreOperation } from "../../core";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmDeleteOr extends CoreOperation {
  static readonly TYPE = PSM.DELETE_OR;

  dataPsmOr: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmDeleteOr.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmDeleteOr {
    return resource?.types.includes(DataPsmDeleteOr.TYPE);
  }
}
