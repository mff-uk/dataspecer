import {CoreResource} from "../core-resource";
import {PsmResource} from "./psm-resource";

export class PsmClass extends PsmResource {

  static readonly TYPE: string = "psm-class";

  psmExtends: string[] = [];

  psmParts: string[] = [];

  static is(resource: CoreResource): resource is PsmClass {
    return resource.types.includes(PsmClass.TYPE);
  }

  static as(resource: CoreResource): PsmClass {
    if (PsmClass.is(resource)) {
      return resource as PsmClass;
    }
    resource.types.push(PsmClass.TYPE);
    const result = resource as PsmClass;
    result.psmExtends = result.psmExtends || [];
    result.psmParts = result.psmParts || [];
    return result;
  }

}
