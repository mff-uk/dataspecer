import {CoreOperation, CoreResource} from "../../core";

export class PimDeleteAttribute extends CoreOperation {

  static readonly TYPE = "pim-action-delete-attribute";

  pimAttribute: string | null = null;

  constructor() {
    super();
    this.types.push(PimDeleteAttribute.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimDeleteAttribute {
    return resource?.types.includes(PimDeleteAttribute.TYPE);
  }

}
