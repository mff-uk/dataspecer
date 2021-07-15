import {CoreResource} from "../core-resource";
import {PimResource} from "./pim-resource";

export class PimAssociationEnd extends PimResource {

  static readonly TYPE: string = "pim-association-end";

  pimPart?: string;

  static is(resource: CoreResource): resource is PimAssociationEnd {
    return resource.types.includes(PimAssociationEnd.TYPE);
  }

  static as(resource: CoreResource): PimAssociationEnd {
    if (PimAssociationEnd.is(resource)) {
      return resource as PimAssociationEnd;
    }
    resource.types.push(PimAssociationEnd.TYPE);
    return resource as PimAssociationEnd;
  }

}

