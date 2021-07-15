import {CoreResource} from "../core-resource";
import {PimResource} from "./pim-resource";

export class PimAssociation extends PimResource {

  static readonly TYPE: string = "pim-association";

  pimEnd: string[] = [];

  pimOwnerClass?: string;

  static is(resource: CoreResource): resource is PimAssociation {
    return resource.types.includes(PimAssociation.TYPE);
  }

  static as(resource: CoreResource): PimAssociation {
    if (PimAssociation.is(resource)) {
      return resource as PimAssociation;
    }
    resource.types.push(PimAssociation.TYPE);
    const result = resource as PimAssociation;
    result.pimEnd = result.pimEnd || [];
    return result;
  }

}
