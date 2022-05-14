import { CoreResource, CoreOperation } from "../../core";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmSetChoice extends CoreOperation {
  static readonly TYPE = PSM.SET_CHOICE;

  dataPsmOr: string | null = null;

  dataPsmChoice: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetChoice.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmSetChoice {
    return resource?.types.includes(DataPsmSetChoice.TYPE);
  }
}
