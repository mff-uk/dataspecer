import {CoreAction} from "../core-action";
import {CoreResource} from "../../model";

export class PsmDeleteAssociationEnd extends CoreAction {

  static readonly TYPE: string = "psm-action-delete-association-end";

  psmAssociationEnd?: string;

  static is(resource: CoreAction): resource is PsmDeleteAssociationEnd {
    return resource.types.includes(PsmDeleteAssociationEnd.TYPE);
  }

  static as(resource: CoreResource): PsmDeleteAssociationEnd {
    if (PsmDeleteAssociationEnd.is(resource)) {
      return resource as PsmDeleteAssociationEnd;
    }
    resource.types.push(PsmDeleteAssociationEnd.TYPE);
    return resource as PsmDeleteAssociationEnd;
  }

}
