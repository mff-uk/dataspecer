import {PimCreate} from "./psm-create";
import {CoreAction} from "../core-action";
import {CoreResource} from "../../model";

export class PsmCreateAttribute extends PimCreate {

  static readonly TYPE: string = "psm-action-create-attribute";

  psmOwnerClass?: string;

  psmDatatype?: string;

  static is(resource: CoreAction): resource is PsmCreateAttribute {
    return resource.types.includes(PsmCreateAttribute.TYPE);
  }

  static as(resource: CoreResource): PsmCreateAttribute {
    if (PsmCreateAttribute.is(resource)) {
      return resource as PsmCreateAttribute;
    }
    resource.types.push(PsmCreateAttribute.TYPE);
    return resource as PsmCreateAttribute;
  }

}
