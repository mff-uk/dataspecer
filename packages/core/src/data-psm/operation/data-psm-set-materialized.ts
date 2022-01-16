import {CoreResource, CoreOperation} from "../../core";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmSetMaterialized extends CoreOperation {

  static readonly TYPE = PSM.SET_MATERIALIZED;

  dataPsmAssociationEnd: string | null = null;

  dataPsmIsMaterialized: boolean | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetMaterialized.TYPE);
  }

  static is(
    resource: CoreResource | null,
  ): resource is DataPsmSetMaterialized {
    return resource?.types.includes(DataPsmSetMaterialized.TYPE);
  }

}
