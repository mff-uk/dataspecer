import {CoreOperationResult, CoreResource, CoreTyped} from "../../core";
import {DataPsmCreate} from "./data-psm-create";

export class DataPsmCreateClass extends DataPsmCreate {

  static readonly TYPE = "data-psm-action-create-class";

  dataPsmExtends: string[] = [];

  constructor() {
    super();
    this.types.push(DataPsmCreateClass.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmCreateClass {
    return resource?.types.includes(DataPsmCreateClass.TYPE);
  }

}

export class DataPsmCreateClassResult extends CoreOperationResult {

  private static readonly TYPE = "psm-action-create-class-result";

  readonly createdDataPsmClass: string;

  protected constructor(dataPsmClass: string) {
    super();
    this.types.push(DataPsmCreateClassResult.TYPE);
    this.createdDataPsmClass = dataPsmClass;
  }

  static is(
    resource: CoreTyped | null,
  ): resource is DataPsmCreateClassResult {
    return resource?.types.includes(DataPsmCreateClassResult.TYPE);
  }

}
