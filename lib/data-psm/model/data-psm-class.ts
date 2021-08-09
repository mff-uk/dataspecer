import {CoreResource} from "../../core";
import {DataPsmResource} from "./data-psm-resource";

/**
 * Class on the PSM level points to all its parts, e.g.: association ends,
 * attributes, choices, etc.. In addition a class may extend another class,
 * by doing so this class automatically and implicitly has inherit all the
 * other class attributes, choices, etc..
 */
export interface DataPsmClass extends DataPsmResource {

  dataPsmExtends: string[];

  dataPsmParts: string[];

}

export const DataPsmClassType = "data-psm-class";

export function isDataPsmClass(
  resource: CoreResource,
): resource is DataPsmClass {
  return resource.types.includes(DataPsmClassType);
}

export function asDataPsmClass(
  resource: CoreResource,
): DataPsmClass {
  if (isDataPsmClass(resource)) {
    return resource as DataPsmClass;
  }
  resource.types.push(DataPsmClassType);
  const result = resource as DataPsmClass;
  result.dataPsmExtends = result.dataPsmExtends || [];
  result.dataPsmParts = result.dataPsmParts || [];
  return result;
}
