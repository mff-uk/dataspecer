import {CoreResource, CoreOperation} from "../../core";

export interface DataPsmDeleteAssociationEnd extends CoreOperation {

  dataPsmOwner?: string;

  dataPsmAssociationEnd?: string;

}

export const DataPsmDeleteAssociationEndType =
  "psm-action-delete-association-end";

export function isDataPsmDeleteAssociationEnd(
  resource: CoreResource,
): resource is DataPsmDeleteAssociationEnd {
  return resource.types.includes(DataPsmDeleteAssociationEndType);
}

export function asDataPsmDeleteAssociationEnd(
  resource: CoreResource,
): DataPsmDeleteAssociationEnd {
  if (isDataPsmDeleteAssociationEnd(resource)) {
    return resource as DataPsmDeleteAssociationEnd;
  }
  resource.types.push(DataPsmDeleteAssociationEndType);
  return resource as DataPsmDeleteAssociationEnd;
}
