import {CoreOperationResult, CoreResource} from "../../core";
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

export interface DataPsmCreateClassResult extends CoreOperationResult {

  createdDataPsmClass: string;

}

export const DataPsmCreateClassResultType =
  "psm-action-create-class-result";

export function isDataPsmCreateClassResult(
  resource: CoreOperationResult,
): resource is DataPsmCreateClassResult {
  return resource.types.includes(DataPsmCreateClassResultType);
}

export function createDataPsmCreateClassResultProperties(
  createdDataPsmClass: string,
) {
  return {
    "types": [DataPsmCreateClassResultType],
    "createdDataPsmClass": createdDataPsmClass,
  };
}
