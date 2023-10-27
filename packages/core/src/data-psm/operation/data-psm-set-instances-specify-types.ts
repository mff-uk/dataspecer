import { CoreOperation, CoreResource } from "../../core";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmSetInstancesSpecifyTypes extends CoreOperation {
  static readonly TYPE = PSM.SET_INSTANCES_SPECIFY_TYPES;

  dataPsmClass: string | null = null;

  /**
   * Require explicit instance typing. For example as @type property in JSON-LD.
   * If set to undefined, the default value will be used which is "ALWAYS" currently.
   */
  instancesSpecifyTypes: "ALWAYS" | "NEVER" | "OPTIONAL" | undefined = undefined;

  constructor() {
    super();
    this.types.push(DataPsmSetInstancesSpecifyTypes.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmSetInstancesSpecifyTypes {
    return resource?.types.includes(DataPsmSetInstancesSpecifyTypes.TYPE);
  }
}
