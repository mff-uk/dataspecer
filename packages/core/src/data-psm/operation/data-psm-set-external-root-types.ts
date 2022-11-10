import { CoreOperation, CoreResource } from "../../core";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmSetExternalRootTypes extends CoreOperation {
  static readonly TYPE = PSM.SET_EXTERNAL_ROOT_TYPES;

  dataPsmExternalRoot: string | null = null;

  dataPsmTypes: string[] = [];

  constructor() {
    super();
    this.types.push(DataPsmSetExternalRootTypes.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmSetExternalRootTypes {
    return resource?.types.includes(DataPsmSetExternalRootTypes.TYPE);
  }
}
