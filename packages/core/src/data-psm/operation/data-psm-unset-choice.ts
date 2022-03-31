import { CoreResource, CoreOperation } from "../../core";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmUnsetChoice extends CoreOperation {
  static readonly TYPE = PSM.UNSET_CHOICE;

  dataPsmOr: string | null = null;

  dataPsmChoice: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmUnsetChoice.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmUnsetChoice {
    return resource?.types.includes(DataPsmUnsetChoice.TYPE);
  }
}
