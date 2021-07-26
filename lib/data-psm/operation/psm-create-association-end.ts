import {PimCreate} from "./psm-create";
import {CoreAction} from "../core-action";
import {CoreResource} from "../../model";

export class PsmCreateAssociationEnd extends PimCreate {

  static readonly TYPE: string = "psm-action-create-association-end";

  psmOwnerClass?: string;

  psmPart?: string;

  static is(resource: CoreAction): resource is PsmCreateAssociationEnd {
    return resource.types.includes(PsmCreateAssociationEnd.TYPE);
  }

  static as(resource: CoreResource): PsmCreateAssociationEnd {
    if (PsmCreateAssociationEnd.is(resource)) {
      return resource as PsmCreateAssociationEnd;
    }
    resource.types.push(PsmCreateAssociationEnd.TYPE);
    return resource as PsmCreateAssociationEnd;
  }

}
