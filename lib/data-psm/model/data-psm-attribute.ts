import {CoreResource} from "../../core";
import {DataPsmResource} from "./data-psm-resource";

/**
 * An attribute is a primitive property. It may be a string, integer etc.
 */
export interface DataPsmAttribute extends DataPsmResource {

  dataPsmDatatype?: string;

}

export const DataPsmAttributeType = "data-psm-attribute";

export function isDataPsmAttribute(
  resource: CoreResource | null,
): resource is DataPsmAttribute {
  return resource !== null
    && resource.types.includes(DataPsmAttributeType);
}

export function asDataPsmAttribute(
  resource: CoreResource,
): DataPsmAttribute {
  if (isDataPsmAttribute(resource)) {
    return resource as DataPsmAttribute;
  }
  resource.types.push(DataPsmAttributeType);
  return resource as DataPsmAttribute;
}
