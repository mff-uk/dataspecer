import {CoreResource, CoreOperation} from "../../core";

export class DataPsmDeleteClass extends CoreOperation {

  static readonly TYPE = "psm-action-delete-class";

  dataPsmClass: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmDeleteClass.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmDeleteClass {
    return resource?.types.includes(DataPsmDeleteClass.TYPE);
  }

}
