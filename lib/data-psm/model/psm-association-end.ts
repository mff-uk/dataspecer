import {CoreResource} from "../core-resource";
import {PsmResource} from "./psm-resource";

/**
 * On the PSM level the complex properties are represented as association
 * ends. An association end can point to a class and any other resource
 * that can be resolved into one or more classes.
 */
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
