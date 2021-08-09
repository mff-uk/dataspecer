import {CoreOperation, CoreResource} from "../../core";

export interface PimDeleteAssociation extends CoreOperation {

  pimAssociation?: string;

}

export const PimDeleteAssociationType = "pim-action-delete-association";

export function isPimDeleteAssociation(
  resource: CoreResource,
): resource is PimDeleteAssociation {
  return resource.types.includes(PimDeleteAssociationType);
}

export function asPimDeleteAssociation(
  resource: CoreResource,
): PimDeleteAssociation {
  if (isPimDeleteAssociation(resource)) {
    return resource as PimDeleteAssociation;
  }
  resource.types.push(PimDeleteAssociationType);
  return resource as PimDeleteAssociation;
}
