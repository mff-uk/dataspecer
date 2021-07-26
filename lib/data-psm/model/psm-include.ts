import {CoreResource} from "../core-resource";
import {PsmResource} from "./psm-resource";

/**
 * This resource can be used as a part of a class, instead of  a particular
 * attribute or association end. This resource act as a syntactic sugar
 * and perform an include of given attribute list in place of this attribute.
 */
export class PsmInclude extends PsmResource {

  static readonly TYPE: string = "psm-include";

  psmParts: string[] = [];

  static is(resource: CoreResource): resource is PsmInclude {
    return resource.types.includes(PsmInclude.TYPE);
  }

  static as(resource: CoreResource): PsmInclude {
    if (PsmInclude.is(resource)) {
      return resource as PsmInclude;
    }
    resource.types.push(PsmInclude.TYPE);
    const result = resource as PsmInclude;
    result.psmParts = result.psmParts || [];
    return result;
  }

}
