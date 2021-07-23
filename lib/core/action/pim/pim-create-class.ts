import {CoreAction} from "../core-action";
import {CoreResource} from "../../model";

export class PimCreateClass extends CoreAction {

  static readonly TYPE: string = "pim-action-create-class";

  pimExtends: string[] = [];

  static is(resource: CoreAction): resource is PimCreateClass {
    return resource.types.includes(PimCreateClass.TYPE);
  }

  static as(resource: CoreResource): PimCreateClass {
    if (PimCreateClass.is(resource)) {
      return resource as PimCreateClass;
    }
    resource.types.push(PimCreateClass.TYPE);
    const result = resource as PimCreateClass;
    result.pimExtends = result.pimExtends || [];
    return result;
  }

}
