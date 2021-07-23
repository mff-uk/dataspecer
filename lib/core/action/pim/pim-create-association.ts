import {PimCreate} from "./pim-create";
import {CoreAction} from "../core-action";
import {CoreResource} from "../../model";

export class PimCreateAssociation extends PimCreate {

  static readonly TYPE: string = "pim-action-create-association";

  pimOwnerClass?: string;

  pimAssociationEnds: string[] = [];

  static is(resource: CoreAction): resource is PimCreateAssociation {
    return resource.types.includes(PimCreateAssociation.TYPE);
  }

  static as(resource: CoreResource): PimCreateAssociation {
    if (PimCreateAssociation.is(resource)) {
      return resource as PimCreateAssociation;
    }
    resource.types.push(PimCreateAssociation.TYPE);
    const result = resource as PimCreateAssociation;
    result.pimAssociationEnds = result.pimAssociationEnds || [];
    return result;
  }

}
