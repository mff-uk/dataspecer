import {CoreResource} from "../../core";
import {DataPsmCreate} from "./data-psm-create";

export interface DataPsmCreateAssociationEnd extends DataPsmCreate {

  dataPsmOwner?: string;

  dataPsmPart?: string;

}

export const DataPsmCreateAssociationEndType =
  "data-psm-action-create-association-end";

export function isDataPsmCreateAssociationEnd(
  resource: CoreResource,
): resource is DataPsmCreateAssociationEnd {
  return resource.types.includes(DataPsmCreateAssociationEndType);
}

export function asDataPsmCreateAssociationEnd(
  resource: CoreResource,
): DataPsmCreateAssociationEnd {
  if (isDataPsmCreateAssociationEnd(resource)) {
    return resource as DataPsmCreateAssociationEnd;
  }
  resource.types.push(DataPsmCreateAssociationEndType);
  return resource as DataPsmCreateAssociationEnd;
}
