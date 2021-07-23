import {CoreResource} from "../core-resource";
import {PimResource} from "./pim-resource";

/**
 * An association connects two entities, but it does not point to entities
 * directly instead it points to association ends that points to the entities.
 *
 * As association connect two entities without any side preference, i.e. there
 * is no order on the ends, the association does not belong to any class.
 */
export class PimAssociation extends PimResource {

  static readonly TYPE: string = "pim-association";

  pimEnd: string[] = [];

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
