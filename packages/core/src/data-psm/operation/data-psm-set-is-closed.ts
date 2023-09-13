import { CoreResource, CoreOperation } from "../../core";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmSetIsClosed extends CoreOperation {
  static readonly TYPE = PSM.SET_IS_CLOSED;

  dataPsmClass: string | null = null;

  dataPsmIsClosed: boolean | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetIsClosed.TYPE);
  }

  static is(
    resource: CoreResource | null
  ): resource is DataPsmSetIsClosed {
    return resource?.types.includes(DataPsmSetIsClosed.TYPE);
  }
}
