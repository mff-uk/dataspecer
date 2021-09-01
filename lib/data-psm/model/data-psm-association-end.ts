import {CoreOperationResult, CoreResource} from "../../core";
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
  resource: unknown,
): resource is DataPsmAssociationEnd {
  return resource !== null
    && resource?.types?.includes(DataPsmAssociationEndType);
}

export function asDataPsmAssociationEnd(
  resource: CoreResource,
): DataPsmAssociationEnd {
  if (isDataPsmAssociationEnd(resource)) {
    return resource as DataPsmAssociationEnd;
  }
  resource.types.push(DataPsmAssociationEndType);
  return resource as DataPsmAssociationEnd;
}
