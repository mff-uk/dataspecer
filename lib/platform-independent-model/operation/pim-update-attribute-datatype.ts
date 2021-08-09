import {CoreOperation, CoreResource} from "../../core";

export interface PimUpdateAttributeDatatype extends CoreOperation {

  pimAttribute?: string;

  pimDatatype?: string;

}

export const PimUpdateAttributeDatatypeType =
  "pim-action-update-attribute-datatype";

export function isPimUpdateAttributeDatatype(
  resource: CoreResource,
): resource is PimUpdateAttributeDatatype {
  return resource.types.includes(PimUpdateAttributeDatatypeType);
}

export function asPimUpdateAttributeDatatype(
  resource: CoreResource,
): PimUpdateAttributeDatatype {
  if (isPimUpdateAttributeDatatype(resource)) {
    return resource as PimUpdateAttributeDatatype;
  }
  resource.types.push(PimUpdateAttributeDatatypeType);
  return resource as PimUpdateAttributeDatatype;
}
