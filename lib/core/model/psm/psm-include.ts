import {CoreResource} from "../core-resource";
import {PsmResource} from "./psm-resource";

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
