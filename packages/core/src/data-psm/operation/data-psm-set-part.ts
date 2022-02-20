import { CoreResource, CoreOperation } from "../../core";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmSetPart extends CoreOperation {
  static readonly TYPE = PSM.SET_PART;

  dataPsmAssociationEnd: string | null = null;

  dataPsmPart: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetPart.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmSetPart {
    return resource?.types.includes(DataPsmSetPart.TYPE);
  }
}
