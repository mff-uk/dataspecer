import {CoreResource} from "../../core";
import {PimResource} from "./pim-resource";

/**
 * Represents a class. On the PIM level the properties are not pointed to
 * from the class. Instead the properties specify an owner class and the
 * associations ends points to classes.
 */
export interface PimClass extends PimResource {

  pimExtends: string[];

}

const PimClassType = "pim-class";

export function isPimClass(
  resource: CoreResource | null,
): resource is PimClass {
  return resource !== null
    && resource.types.includes(PimClassType);
}

export function asPimClass(resource: CoreResource): PimClass {
  if (isPimClass(resource)) {
    return resource as PimClass;
  }
  resource.types.push(PimClassType);
  const result = resource as PimClass;
  result.pimExtends = result.pimExtends || [];
  return result;
}
