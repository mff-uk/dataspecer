import {CoreResource, CoreOperation} from "../../core";

export interface DataPsmDeleteClass extends CoreOperation {

  psmClass?: string;

}

export const DataPsmDeleteClassType =
  "psm-action-delete-class";

export function isDataPsmDeleteClass(
  resource: CoreResource
): resource is DataPsmDeleteClass {
  return resource.types.includes(DataPsmDeleteClassType);
}

export function as(resource: CoreResource): DataPsmDeleteClass {
  if (isDataPsmDeleteClass(resource)) {
    return resource as DataPsmDeleteClass;
  }
  resource.types.push(DataPsmDeleteClassType);
  return resource as DataPsmDeleteClass;
}
