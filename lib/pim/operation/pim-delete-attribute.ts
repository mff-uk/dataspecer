import {CoreOperation, CoreResource} from "../../core";

export interface PimDeleteAttribute extends CoreOperation {

  pimAttribute?: string;

}

export const PimDeleteAttributeType = "pim-action-delete-attribute";

export function isPimDeleteAttribute(
  resource: CoreResource,
): resource is PimDeleteAttribute {
  return resource.types.includes(PimDeleteAttributeType);
}

export function asPimDeleteAttribute(
  resource: CoreResource,
): PimDeleteAttribute {
  if (isPimDeleteAttribute(resource)) {
    return resource as PimDeleteAttribute;
  }
  resource.types.push(PimDeleteAttributeType);
  return resource as PimDeleteAttribute;
}
