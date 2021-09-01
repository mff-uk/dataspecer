import {CoreOperationResult, CoreResource} from "../../core";
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

export interface DataPsmCreateAttributeResult extends CoreOperationResult {

  createdDataPsmAttribute: string;

}

export const DataPsmCreateAttributeResultType =
  "psm-attribute-end-result";

export function isDataPsmCreateAttributeResult(
  resource: CoreOperationResult,
): resource is DataPsmCreateAttributeResult {
  return resource.types.includes(DataPsmCreateAttributeResultType);
}

export function createDataPsmCreateAttributeResultProperties(
  createdDataPsmAttribute: string,
) {
  return {
    "types": [DataPsmCreateAttributeResultType],
    "createdDataPsmAttribute": createdDataPsmAttribute,
  };
}
