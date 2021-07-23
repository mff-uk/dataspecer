import {CoreResource} from "../core-resource";
import {PimResource} from "./pim-resource";

/**
 * Represents a class. On the PIM level the properties are not pointed to
 * from the class. Instead the properties specify an owner class and the
 * associations ends points to classes.
 */
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
