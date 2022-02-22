import { CoreResource, CoreOperation } from "../../core";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmDeleteClass extends CoreOperation {
  static readonly TYPE = PSM.DELETE_CLASS;

  dataPsmClass: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmDeleteClass.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmDeleteClass {
    return resource?.types.includes(DataPsmDeleteClass.TYPE);
  }
}
