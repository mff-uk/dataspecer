import { CoreResource, CoreOperation } from "../../core";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmDeleteExternalRoot extends CoreOperation {
  static readonly TYPE = PSM.DELETE_EXTERNAL_ROOT;

  dataPsmExternalRoot: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmDeleteExternalRoot.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmDeleteExternalRoot {
    return resource?.types.includes(DataPsmDeleteExternalRoot.TYPE);
  }
}
