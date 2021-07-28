import {CoreResource} from "../../core";
import {DataPsmResource} from "./data-psm-resource";

/**
 * On the PSM level the complex properties are represented as association
 * ends. An association end can point to a class and any other resource
 * that can be resolved into one or more classes.
 */
export interface DataPsmAssociationEnd extends DataPsmResource {

  dataPsmPart?: string;

}

export const DataPsmAssociationEndType = "data-psm-association-end";

export function isDataPsmAssociationEnd(
  resource: CoreResource
): resource is DataPsmAssociationEnd {
  return resource.types.includes(DataPsmAssociationEndType);
}

export function asDataPsmAssociationEnd(
  resource: CoreResource
): DataPsmAssociationEnd {
  if (isDataPsmAssociationEnd(resource)) {
    return resource as DataPsmAssociationEnd;
  }
  resource.types.push(DataPsmAssociationEndType);
  return resource as DataPsmAssociationEnd;
}
