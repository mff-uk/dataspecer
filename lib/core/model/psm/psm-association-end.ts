import {CoreResource} from "../core-resource";
import {PsmResource} from "./psm-resource";

export class PsmAssociationEnd extends PsmResource {

  static readonly TYPE: string = "psm-association-end";

  psmPart?: string;

  static is(resource: CoreResource): resource is PsmAssociationEnd {
    return resource.types.includes(PsmAssociationEnd.TYPE);
  }

  static as(resource: CoreResource): PsmAssociationEnd {
    if (PsmAssociationEnd.is(resource)) {
      return resource as PsmAssociationEnd;
    }
    resource.types.push(PsmAssociationEnd.TYPE);
    return resource as PsmAssociationEnd;
  }

}
