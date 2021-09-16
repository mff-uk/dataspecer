import {CoreOperation, CoreResource} from "../../core";

export class PimDeleteClass extends CoreOperation {

  static readonly TYPE = "pim-action-delete-class";

  pimClass: string | null = null;

  constructor() {
    super();
    this.types.push(PimDeleteClass.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimDeleteClass {
    return resource?.types.includes(PimDeleteClass.TYPE);
  }

}
