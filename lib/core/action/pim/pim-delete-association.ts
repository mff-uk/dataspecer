import {CoreAction} from "../core-action";
import {CoreResource} from "../../model"

export class PimDeleteAssociation extends CoreAction {

  static readonly TYPE: string = "pim-action-delete-association";

  pimAssociation?: string;

  static is(resource: CoreAction): resource is PimDeleteAssociation {
    return resource.types.includes(PimDeleteAssociation.TYPE);
  }

  static as(resource: CoreResource): PimDeleteAssociation {
    if (PimDeleteAssociation.is(resource)) {
      return resource as PimDeleteAssociation;
    }
    resource.types.push(PimDeleteAssociation.TYPE);
    return resource as PimDeleteAssociation;
  }


}
