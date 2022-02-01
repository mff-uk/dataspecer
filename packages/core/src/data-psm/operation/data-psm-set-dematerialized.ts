import {CoreResource, CoreOperation} from "../../core";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmSetDematerialized extends CoreOperation {

  static readonly TYPE = PSM.SET_MATERIALIZED;

  dataPsmAssociationEnd: string | null = null;

  dataPsmIsDematerialized: boolean | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetDematerialized.TYPE);
  }

  static is(
    resource: CoreResource | null,
  ): resource is DataPsmSetDematerialized {
    return resource?.types.includes(DataPsmSetDematerialized.TYPE);
  }

}
