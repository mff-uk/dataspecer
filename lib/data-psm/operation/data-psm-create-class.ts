import {CoreResource} from "../../core";
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
