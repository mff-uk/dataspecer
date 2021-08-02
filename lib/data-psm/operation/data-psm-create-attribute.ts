import {CoreResource} from "../../core";
import {DataPsmCreate} from "./data-psm-create";

export interface DataPsmCreateAttribute extends DataPsmCreate {

  dataPsmOwner?: string;

  dataPsmDatatype?: string;

}

export const DataPsmCreateAttributeType = "psm-action-create-attribute";

export function isDataPsmCreateAttribute(
  resource: CoreResource,
): resource is DataPsmCreateAttribute {
  return resource.types.includes(DataPsmCreateAttributeType);
}

export function asDataPsmCreateAttribute(
  resource: CoreResource,
): DataPsmCreateAttribute {
  if (isDataPsmCreateAttribute(resource)) {
    return resource as DataPsmCreateAttribute;
  }
  resource.types.push(DataPsmCreateAttributeType);
  return resource as DataPsmCreateAttribute;
}
