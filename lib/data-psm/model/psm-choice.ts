import {CoreResource} from "../core-resource";
import {PsmResource} from "./psm-resource";

/**
 * Represent a choice among multiple classes.
 */
export class PsmChoice extends PsmResource {

  static readonly TYPE: string = "psm-choice";

  psmParts: string[] = [];

  static is(resource: CoreResource): resource is PsmChoice {
    return resource.types.includes(PsmChoice.TYPE);
  }

  static as(resource: CoreResource): PsmChoice {
    if (PsmChoice.is(resource)) {
      return resource as PsmChoice;
    }
    resource.types.push(PsmChoice.TYPE);
    const result = resource as PsmChoice;
    result.psmParts = result.psmParts || [];
    return result;
  }

}
