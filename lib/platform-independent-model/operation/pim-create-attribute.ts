import {CoreResource} from "../../core";
import {PimCreate} from "./pim-create";

export interface PimCreateAttribute extends PimCreate {

  pimOwnerClass?: string;

  pimDatatype?: string;

}

export const PimCreateAttributeType = "pim-action-create-attribute";

export function isPimCreateAttribute(
  resource: CoreResource
): resource is PimCreateAttribute {
  return resource.types.includes(PimCreateAttributeType);
}

export function asPimCreateAttribute(
  resource: CoreResource
): PimCreateAttribute {
  if (isPimCreateAttribute(resource)) {
    return resource as PimCreateAttribute;
  }
  resource.types.push(PimCreateAttributeType);
  return resource as PimCreateAttribute;
}
