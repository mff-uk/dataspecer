import {CoreOperationResult, CoreResource, CoreTyped} from "../../core";
import {PimCreate} from "./pim-create";

export class PimCreateAttribute extends PimCreate {

  static readonly TYPE = "pim-action-create-attribute";

  pimOwnerClass: string | null = null;

  pimDatatype: string | null = null;

  constructor() {
    super();
    this.types.push(PimCreateAttribute.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimCreateAttribute {
    return resource?.types.includes(PimCreateAttribute.TYPE);
  }

}

export class PimCreateAttributeResult extends CoreOperationResult {

  private static readonly TYPE = "pim-action-create-attribute-result";

  createdPimAttribute: string;

  constructor(createdPimAttribute: string) {
    super();
    this.types.push(PimCreateAttributeResult.TYPE);
    this.createdPimAttribute = createdPimAttribute;
  }

  static is(
    resource: CoreTyped,
  ): resource is PimCreateAttributeResult {
    return resource.types.includes(PimCreateAttributeResult.TYPE);
  }

}
