import {CoreResource} from "../../core";
import {PimResource} from "./pim-resource";

/**
 * An association connects two entities, but it does not point to entities
 * directly instead it points to association ends that points to the entities.
 *
 * As association connect two entities without any side preference, i.e. there
 * is no order on the ends, the association does not belong to any class.
 */
export interface PimAssociation extends PimResource {

  pimEnd: string[];

}

const PimAssociationType = "pim-association";

export function isPimAssociation(
  resource: CoreResource,
): resource is PimAssociation {
  return resource.types.includes(PimAssociationType);
}

export function asPimAssociation(resource: CoreResource): PimAssociation {
  if (isPimAssociation(resource)) {
    return resource as PimAssociation;
  }
  resource.types.push(PimAssociationType);
  const result = resource as PimAssociation;
  result.pimEnd = result.pimEnd || [];
  return result;
}
