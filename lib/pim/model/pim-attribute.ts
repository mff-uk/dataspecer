import {CoreResource} from "../../core";
import {PimResource} from "./pim-resource";

/**
 * An attribute is a primitive property that belongs to a class. It may be
 * a string, integer etc.
 */
export interface PimAttribute extends PimResource {

  pimDatatype?: string;

  pimOwnerClass?: string;

}

const PimAttributeType = "pim-attribute";

export function isPimAttribute(
  resource: CoreResource | null,
): resource is PimAttribute {
  return resource !== null
    && resource.types.includes(PimAttributeType);
}

export function asPimAttribute(
  resource: CoreResource,
): PimAttribute {
  if (isPimAttribute(resource)) {
    return resource as PimAttribute;
  }
  resource.types.push(PimAttributeType);
  return resource as PimAttribute;
}
