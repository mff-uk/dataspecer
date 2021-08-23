import {CoreResource} from "../../core";
import {PimCreate} from "./pim-create";

export interface PimCreateClass extends PimCreate {

  pimExtends: string[];

}

export const PimCreateClassType = "pim-action-create-class";

export function isPimCreateClass(
  resource: CoreResource,
): resource is PimCreateClass {
  return resource.types.includes(PimCreateClassType);
}

export function asPimCreateClass(
  resource: CoreResource,
): PimCreateClass {
  if (isPimCreateClass(resource)) {
    return resource as PimCreateClass;
  }
  resource.types.push(PimCreateClassType);
  const result = resource as PimCreateClass;
  result.pimExtends = result.pimExtends || [];
  return result;
}
