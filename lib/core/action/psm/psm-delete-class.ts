import {CoreAction} from "../core-action";
import {CoreResource} from "../../model";

export class PsmDeleteClass extends CoreAction {

  static readonly TYPE: string = "psm-action-delete-class";

  psmClass?: string;

  static is(resource: CoreAction): resource is PsmDeleteClass {
    return resource.types.includes(PsmDeleteClass.TYPE);
  }

  static as(resource: CoreResource): PsmDeleteClass {
    if (PsmDeleteClass.is(resource)) {
      return resource as PsmDeleteClass;
    }
    resource.types.push(PsmDeleteClass.TYPE);
    return resource as PsmDeleteClass;
  }

}
