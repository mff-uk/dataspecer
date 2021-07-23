import {CoreAction} from "../core-action";
import {CoreResource} from "../../model";

export class PsmUpdateOrder extends CoreAction {

  static readonly TYPE: string = "psm-action-update-order";

  psmResource: string;

  psmMoveAfter: string;

  static is(resource: CoreAction): resource is PsmUpdateOrder {
    return resource.types.includes(PsmUpdateOrder.TYPE);
  }

  static as(resource: CoreResource): PsmUpdateOrder {
    if (PsmUpdateOrder.is(resource)) {
      return resource as PsmUpdateOrder;
    }
    resource.types.push(PsmUpdateOrder.TYPE);
    return resource as PsmUpdateOrder;
  }

}
