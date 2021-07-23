import {PimCreate} from "./pim-create";
import {CoreAction} from "../core-action";
import {CoreResource} from "../../model";

export class PimCreateAttribute extends PimCreate {

  static readonly TYPE: string = "pim-action-create-attribute";

  pimOwnerClass?: string;

  pimDatatype?: string;

  static is(resource: CoreAction): resource is PimCreateAttribute {
    return resource.types.includes(PimCreateAttribute.TYPE);
  }

  static as(resource: CoreResource): PimCreateAttribute {
    if (PimCreateAttribute.is(resource)) {
      return resource as PimCreateAttribute;
    }
    resource.types.push(PimCreateAttribute.TYPE);
    return resource as PimCreateAttribute;
  }

}
