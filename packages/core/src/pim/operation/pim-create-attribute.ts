import { CoreOperationResult, CoreResource, CoreTyped } from "../../core";
import { PimCreate } from "./pim-create";
import * as PIM from "../pim-vocabulary";

export class PimCreateAttribute extends PimCreate {
  static readonly TYPE = PIM.CREATE_ATTRIBUTE;

  pimOwnerClass: string | null = null;

  pimDatatype: string | null = null;

  pimCardinalityMin: number | null = null;

  pimCardinalityMax: number | null = null;

  constructor() {
    super();
    this.types.push(PimCreateAttribute.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimCreateAttribute {
    return resource?.types.includes(PimCreateAttribute.TYPE);
  }
}

export class PimCreateAttributeResult extends CoreOperationResult {
  static readonly TYPE = PIM.CREATE_ATTRIBUTE_RESULT;

  createdPimAttribute: string;

  constructor(createdPimAttribute: string) {
    super();
    this.types.push(PimCreateAttributeResult.TYPE);
    this.createdPimAttribute = createdPimAttribute;
  }

  static is(resource: CoreTyped): resource is PimCreateAttributeResult {
    return resource.types.includes(PimCreateAttributeResult.TYPE);
  }
}
