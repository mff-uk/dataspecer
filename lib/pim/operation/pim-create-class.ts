import {CoreOperationResult, CoreResource, CoreTyped} from "../../core";
import {PimCreate} from "./pim-create";

export class PimCreateClass extends PimCreate {

  static readonly TYPE = "pim-action-create-class";

  pimExtends: string[] = [];

  constructor() {
    super();
    this.types.push(PimCreateClass.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimCreateClass {
    return resource?.types.includes(PimCreateClass.TYPE);
  }

}

export class PimCreateClassResult extends CoreOperationResult {

  private static readonly TYPE = "pim-action-create-class-result";

  createdPimClass: string;

  constructor(createdPimClass: string) {
    super();
    this.types.push(PimCreateClassResult.TYPE);
    this.createdPimClass = createdPimClass;
  }

  static is(
    resource: CoreTyped,
  ): resource is PimCreateClassResult {
    return resource.types.includes(PimCreateClassResult.TYPE);
  }

}
