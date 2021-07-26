import {CoreAction} from "../core-action";
import {CoreResource} from "../../model";

export class PsmDeleteAttribute extends CoreAction {

  static readonly TYPE: string = "psm-action-delete-attribute";

  psmAttribute?: string;

  static is(resource: CoreAction): resource is PsmDeleteAttribute {
    return resource.types.includes(PsmDeleteAttribute.TYPE);
  }

  static as(resource: CoreResource): PsmDeleteAttribute {
    if (PsmDeleteAttribute.is(resource)) {
      return resource as PsmDeleteAttribute;
    }
    resource.types.push(PsmDeleteAttribute.TYPE);
    return resource as PsmDeleteAttribute;
  }

}
