import {PimCreate} from "./psm-create";
import {CoreAction} from "../core-action";
import {CoreResource} from "../../model";

export class PsmCreateClass extends PimCreate {

  static readonly TYPE: string = "psm-action-create-class";

  psmExtends: string[] = [];

  psmParts: string[] = [];

  static is(resource: CoreAction): resource is PsmCreateClass {
    return resource.types.includes(PsmCreateClass.TYPE);
  }

  static as(resource: CoreResource): PsmCreateClass {
    if (PsmCreateClass.is(resource)) {
      return resource as PsmCreateClass;
    }
    resource.types.push(PsmCreateClass.TYPE);
    const result = resource as PsmCreateClass;
    result.psmExtends = result.psmExtends || [];
    result.psmParts = result.psmParts || [];
    return result;
  }

}
