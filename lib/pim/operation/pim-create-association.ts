import {CoreOperationResult, CoreResource} from "../../core";
import {PimCreate} from "./pim-create";

export interface PimCreateAssociation extends PimCreate {

  pimAssociationEnds: string[];

}

export const PimCreateAssociationType = "pim-action-create-association";

export function isPimCreateAssociation(
  resource: CoreResource,
): resource is PimCreateAssociation {
  return resource.types.includes(PimCreateAssociationType);
}

export function asPimCreateAssociation(
  resource: CoreResource,
): PimCreateAssociation {
  if (isPimCreateAssociation(resource)) {
    return resource as PimCreateAssociation;
  }
  resource.types.push(PimCreateAssociationType);
  const result = resource as PimCreateAssociation;
  result.pimAssociationEnds = result.pimAssociationEnds || [];
  return result;
}

export interface PimCreateAssociationResult extends CoreOperationResult  {

  createdPimAssociation: string;

  createdPimAssociationEnds: string[];

}

export const PimCreateAssociationResultType =
  "pim-action-create-association-result";

export function isPimCreateAssociationResult(
  resource: CoreOperationResult,
): resource is PimCreateAssociationResult {
  return resource.types.includes(PimCreateAssociationResultType);
}

export function createPimCreateAssociationResultProperties(
  createdPimAssociation:string,
  createdPimAssociationEnds: string[],
) {
  return {
    "types": [PimCreateAssociationResultType],
    "createdPimAssociation": createdPimAssociation,
    "createdPimAssociationEnds": createdPimAssociationEnds,
  };
}
