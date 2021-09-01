import {CoreOperationResult, CoreResource} from "../../core";
import {PimCreate} from "./pim-create";
import {PimCreateAttributeResultType} from "./pim-create-attribute";

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

export interface PimCreateClassResult extends CoreOperationResult  {

  createdPimClass: string;

}

export const PimCreateClassResultType =
  "pim-action-create-class-result";

export function isPimCreateClassResult(
  resource: CoreOperationResult,
): resource is PimCreateClassResult {
  return resource.types.includes(PimCreateClassResultType);
}

export function createPimCreateClassResultProperties(
  createdPimClass:string,
) {
  return {
    "types": [PimCreateClassResultType],
    "createdPimClass": createdPimClass,
  };
}
