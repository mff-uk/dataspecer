import { CoreOperation, CoreResource } from "../../core";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmSetInstancesHaveIdentity extends CoreOperation {
  static readonly TYPE = PSM.SET_INSTANCES_HAVE_IDENTITY;

  dataPsmClass: string | null = null;

  /**
   * Whether instances of this class may/must/must not have identity, for example IRI.
   * If set to undefined, the default value will be used which is "ALWAYS" currently.
   */
  instancesHaveIdentity: "ALWAYS" | "NEVER" | "OPTIONAL" | undefined = undefined;

  constructor() {
    super();
    this.types.push(DataPsmSetInstancesHaveIdentity.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmSetInstancesHaveIdentity {
    return resource?.types.includes(DataPsmSetInstancesHaveIdentity.TYPE);
  }
}
