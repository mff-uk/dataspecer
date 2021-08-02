import {CoreResource, CoreOperation} from "../../core";

export interface DataPsmDeleteAttribute extends CoreOperation {

  dataPsmOwner?: string;

  dataPsmAttribute?: string;

}

export const DataPsmDeleteAttributeType =
  "psm-action-delete-attribute";

export function isDataPsmDeleteAttribute(
  resource: CoreResource,
): resource is DataPsmDeleteAttribute {
  return resource.types.includes(DataPsmDeleteAttributeType);
}

export function asDataPsmDeleteAttribute(
  resource: CoreResource,
): DataPsmDeleteAttribute {
  if (isDataPsmDeleteAttribute(resource)) {
    return resource as DataPsmDeleteAttribute;
  }
  resource.types.push(DataPsmDeleteAttributeType);
  return resource as DataPsmDeleteAttribute;
}
