import {CoreResource} from "../core-resource";
import {PimResource} from "./pim-resource";

export class PimClass extends PimResource {

  static readonly TYPE: string = "pim-class";

  pimExtends: string[] = [];

  static is(resource: CoreResource): resource is PimClass {
    return resource.types.includes(PimClass.TYPE);
  }

  static as(resource: CoreResource): PimClass {
    if (PimClass.is(resource)) {
      return resource as PimClass;
    }
    resource.types.push(PimClass.TYPE);
    const result = resource as PimClass;
    result.pimExtends = result.pimExtends || [];
    return result;
  }

}
