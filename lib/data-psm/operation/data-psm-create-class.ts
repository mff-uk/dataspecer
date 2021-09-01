import { CoreResource, CoreTyped} from "../../core";
import {DataPsmCreate} from "./data-psm-create";

export interface DataPsmCreateClass extends DataPsmCreate {

  dataPsmExtends: string[];

}

export const DataPsmCreateClassType = "psm-action-create-class";

export function isDataPsmCreateClass(
  resource: CoreResource,
): resource is DataPsmCreateClass {
  return resource.types.includes(DataPsmCreateClassType);
}

export function asDataPsmCreateClass(
  resource: CoreResource,
): DataPsmCreateClass {
  if (isDataPsmCreateClass(resource)) {
    return resource as DataPsmCreateClass;
  }
  resource.types.push(DataPsmCreateClassType);
  const result = resource as DataPsmCreateClass;
  result.dataPsmExtends = result.dataPsmExtends || [];
  return result;
}

export interface DataPsmCreateClassResult extends CoreTyped {

  createdDataPsmClass: string;

}

export const DataPsmCreateClassResultType =
  "psm-action-create-class-result";

export function isDataPsmCreateClassResult(
  resource: CoreTyped,
): resource is DataPsmCreateClassResult {
  return resource.types.includes(DataPsmCreateClassResultType);
}

export function createDataPsmCreateClassResultProperties(
  createdDataPsmClass: string,
): DataPsmCreateClassResult {
  return {
    "types": [DataPsmCreateClassResultType],
    "createdDataPsmClass": createdDataPsmClass,
  };
}
