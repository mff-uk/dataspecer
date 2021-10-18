import {CoreOperation, CoreResource} from "../../core";

export class DataPsmSetRoots extends CoreOperation {

  static readonly TYPE = "data-psm-action-set-roots";

  /**
   * New value of the schema roots property.
   */
  dataPsmRoots: string[] = [];

  constructor() {
    super();
    this.types.push(DataPsmSetRoots.TYPE);
  }

  static is(
    resource: CoreResource | null,
  ): resource is DataPsmSetRoots {
    return resource?.types.includes(DataPsmSetRoots.TYPE);
  }

}
