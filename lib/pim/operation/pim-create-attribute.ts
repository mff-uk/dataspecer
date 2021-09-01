import {CoreOperationResult, CoreResource} from "../../core";
import {PimCreate} from "./pim-create";
import {PimCreateAssociationResultType} from "./pim-create-association";

export interface PimCreateAttribute extends PimCreate {

  pimOwnerClass?: string;

  pimDatatype?: string;

}

export const PimCreateAttributeType = "pim-action-create-attribute";

export function isPimCreateAttribute(
  resource: CoreResource,
): resource is PimCreateAttribute {
  return resource.types.includes(PimCreateAttributeType);
}

export function asPimCreateAttribute(
  resource: CoreResource,
): PimCreateAttribute {
  if (isPimCreateAttribute(resource)) {
    return resource as PimCreateAttribute;
  }
  resource.types.push(PimCreateAttributeType);
  return resource as PimCreateAttribute;
}

export interface PimCreateAttributeResult extends CoreOperationResult  {

  createdPimAttribute: string;

}

export const PimCreateAttributeResultType =
  "pim-action-create-attribute-result";

export function isPimCreateAttributeResult(
  resource: CoreOperationResult,
): resource is PimCreateAttributeResult {
  return resource.types.includes(PimCreateAttributeResultType);
}

export function createPimCreateAttributeResultProperties(
  createdPimAttribute:string,
) {
  return {
    "types": [PimCreateAttributeResultType],
    "createdPimAttribute": createdPimAttribute,
  };
}
