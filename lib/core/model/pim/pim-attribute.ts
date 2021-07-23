import {CoreResource} from "../core-resource";
import {PimResource} from "./pim-resource";

/**
 * An attribute is a primitive property that belongs to a class. It may be
 * a string, integer etc.
 */
export class PimAttribute extends PimResource {

  static readonly TYPE: string = "pim-attribute";

  pimDatatype?: string;

  pimOwnerClass?: string;

  static is(resource: CoreResource): resource is PimAttribute {
    return resource.types.includes(PimAttribute.TYPE);
  }

  static as(resource: CoreResource): PimAttribute {
    if (PimAttribute.is(resource)) {
      return resource as PimAttribute;
    }
    resource.types.push(PimAttribute.TYPE);
    return resource as PimAttribute;
  }

}
