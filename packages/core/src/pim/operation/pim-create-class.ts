import { CoreOperationResult, CoreResource, CoreTyped } from "../../core";
import { PimCreate } from "./pim-create";
import * as PIM from "../pim-vocabulary";

export class PimCreateClass extends PimCreate {
  static readonly TYPE = PIM.CREATE_CLASS;

  pimExtends: string[] = [];

  pimIsCodelist = false;

  constructor() {
    super();
    this.types.push(PimCreateClass.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimCreateClass {
    return resource?.types.includes(PimCreateClass.TYPE);
  }
}

export class PimCreateClassResult extends CoreOperationResult {
  static readonly TYPE = PIM.CREATE_CLASS_RESULT;

  createdPimClass: string;

  constructor(createdPimClass: string) {
    super();
    this.types.push(PimCreateClassResult.TYPE);
    this.createdPimClass = createdPimClass;
  }

  static is(resource: CoreTyped): resource is PimCreateClassResult {
    return resource.types.includes(PimCreateClassResult.TYPE);
  }
}
