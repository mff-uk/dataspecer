import {CoreOperation, CoreResource} from "../../core";

export interface PimDeleteClass extends CoreOperation {

  pimClass?: string;

}

export const PimDeleteClassType = "pim-action-delete-class";

export function isPimDeleteClass(
  resource: CoreResource,
): resource is PimDeleteClass {
  return resource.types.includes(PimDeleteClassType);
}

export function asPimDeleteClass(
  resource: CoreResource,
): PimDeleteClass {
  if (isPimDeleteClass(resource)) {
    return resource as PimDeleteClass;
  }
  resource.types.push(PimDeleteClassType);
  return resource as PimDeleteClass;
}
