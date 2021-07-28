import {CoreResource} from "../../core";
import {PimCreate} from "./pim-create";

export interface PimCreateAssociation extends PimCreate {

  pimAssociationEnds: string[];

}

export const PimCreateAssociationType = "pim-action-create-association";

export function isPimCreateAssociation(
  resource: CoreResource
): resource is PimCreateAssociation {
  return resource.types.includes(PimCreateAssociationType);
}

export function asPimCreateAssociation(
  resource: CoreResource
): PimCreateAssociation {
  if (isPimCreateAssociation(resource)) {
    return resource as PimCreateAssociation;
  }
  resource.types.push(PimCreateAssociationType);
  const result = resource as PimCreateAssociation;
  result.pimAssociationEnds = result.pimAssociationEnds || [];
  return result;
}
